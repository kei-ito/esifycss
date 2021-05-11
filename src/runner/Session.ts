import * as fs from 'fs';
import * as chokidar from 'chokidar';
import * as path from 'path';
import type {SessionOptions, SessionConfiguration} from './types';
import {getSessionConfiguration} from './getSessionConfiguration';
import {parseCSS} from './parseCSS';
import {extractPluginResult} from './extractPluginResult';
import {generateScript} from './generateScript';
import {waitForInitialScanCompletion} from './waitForInitialScanCompletion';
import {minifyScripts} from '../minifier/minifyScripts';
import type {ExposedPromise} from '../util/createExposedPromise';
import {createExposedPromise} from '../util/createExposedPromise';
import {minifyScriptsForCSS} from '../minifier/minifyScriptsForCSS';
import {deleteFile} from '../util/deleteFile';
import {writeFilep} from '../util/writeFilep';
import {serialize} from '../util/serialize';
const {copyFile} = fs.promises;

export class Session {

    public readonly configuration: Readonly<SessionConfiguration>;

    protected watcher?: chokidar.FSWatcher;

    protected processedFiles: Set<string>;

    protected initialTask: Array<Promise<void>> | null;

    protected tasks: Set<Promise<void>>;

    public constructor(parameters: SessionOptions = {}) {
        this.configuration = getSessionConfiguration(parameters);
        this.processedFiles = new Set();
        this.initialTask = null;
        this.tasks = new Set();
    }

    public get helperPath(): string {
        const srcDirectory = path.join(__dirname, '..', 'helper');
        const name = this.configuration.output.type === 'script' ? 'default' : 'noop';
        return path.join(srcDirectory, `${name}${this.configuration.ext}`);
    }

    public async start(): Promise<void> {
        await this.outputHelperScript();
        await this.startWatcher();
    }

    public async stop(): Promise<void> {
        await this.stopWatcher();
    }

    public async outputHelperScript(): Promise<void> {
        if (this.configuration.output.type === 'script') {
            await copyFile(this.helperPath, this.configuration.output.path);
        }
    }

    public async processCSS(
        filePath: string,
    ): Promise<{dest: string, code: string}> {
        if (0 < this.tasks.size) {
            await this.waitCurrentTasks();
        }
        const exposedPromise = this.createExposedPromise();
        const {configuration} = this;
        const postcssResult = await parseCSS({
            plugins: configuration.postcssPlugins,
            options: configuration.postcssOptions,
            file: filePath,
        })
        .catch((error) => {
            exposedPromise.resolve();
            throw error;
        });
        const dest = path.join(`${filePath}${configuration.ext}`);
        this.processedFiles.add(filePath);
        const {output} = configuration;
        const code = generateScript({
            output: dest,
            helper: output.type === 'css' ? this.helperPath : output.path,
            result: extractPluginResult(postcssResult),
            root: postcssResult.root,
            cssKey: this.configuration.cssKey,
        });
        exposedPromise.resolve();
        return {dest, code};
    }

    public async minifyScripts(): Promise<void> {
        const files = [...this.processedFiles].map((file) => `${file}${this.configuration.ext}`);
        const {cssKey, output} = this.configuration;
        if (output.type === 'css') {
            await minifyScriptsForCSS({files, cssKey, dest: output.path});
        } else {
            await minifyScripts({files, cssKey, dest: output.path});
        }
    }

    protected async waitCurrentTasks(): Promise<void> {
        await Promise.all([...this.tasks]);
    }

    protected createExposedPromise(): ExposedPromise {
        const exposedPromise = createExposedPromise();
        this.tasks.add(exposedPromise.promise);
        const removeTask = () => this.tasks.delete(exposedPromise.promise);
        exposedPromise.promise.then(removeTask).catch(removeTask);
        return exposedPromise;
    }

    protected async startWatcher(): Promise<void> {
        await this.stopWatcher();
        this.initialTask = [];
        this.log(`watching: ${this.configuration.path.join(', ')}`);
        const onError = this.onError.bind(this);
        this.watcher = chokidar.watch(this.configuration.path, this.configuration.chokidar)
        .on('error', onError)
        .on('add', (file, stats) => {
            this.log(`[add] ${file}`);
            const promise = this.onAdd(file, stats);
            if (this.initialTask) {
                this.initialTask.push(promise);
            }
            promise.catch(onError);
        })
        .on('change', (file, stats) => {
            this.log(`[change] ${file}`);
            this.onChange(file, stats).catch(onError);
        })
        .on('unlink', (file) => {
            this.log(`[unlink] ${file}`);
            this.onUnlink(file).catch(onError);
        });
        await waitForInitialScanCompletion(this.watcher);
        await Promise.all(this.initialTask);
        this.initialTask = null;
        if (!this.configuration.watch) {
            await this.minifyScripts();
            await this.stop();
        }
    }

    protected log(...values: Array<unknown>): void {
        const {configuration: {stdout}} = this;
        for (const value of values) {
            stdout.write(`${serialize(value)}\n`);
        }
    }

    protected logError(...values: Array<unknown>): void {
        const {configuration: {stderr}} = this;
        for (const value of values) {
            stderr.write(`${serialize(value)}\n`);
        }
    }

    protected async stopWatcher(): Promise<void> {
        if (this.watcher) {
            await this.watcher.close();
            delete this.watcher;
        }
        await Promise.resolve(null);
    }

    protected onError(error: Error): void {
        this.logError(error);
    }

    protected async onAdd(
        file: string,
        stats?: fs.Stats,
    ): Promise<void> {
        await this.onChange(file, stats);
    }

    protected async onChange(
        file: string,
        stats?: fs.Stats,
    ): Promise<void> {
        if (!stats) {
            throw new Error(`no stats is given for ${file}.`);
        }
        if (!stats.isFile()) {
            throw new Error(`${file} is not a file.`);
        }
        const {dest, code} = await this.processCSS(file);
        await writeFilep(dest, code);
        this.log(`written: ${dest}`);
    }

    protected async onUnlink(
        file: string,
    ): Promise<void> {
        const outputPath = path.join(`${file}${this.configuration.ext}`);
        this.processedFiles.delete(file);
        await deleteFile(outputPath);
        this.log(`deleted: ${outputPath}`);
    }

}
