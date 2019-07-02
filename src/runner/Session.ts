import * as fs from 'fs';
import * as chokidar from 'chokidar';
import * as path from 'path';
import {ISessionOptions, ISessionConfiguration} from './types';
import {getSessionConfiguration} from './getSessionConfiguration';
import {write} from '../util/write';
import {parseCSS} from './parseCSS';
import {extractPluginResult} from './extractPluginResult';
import {writeFile, deleteFile, copyFile} from '../util/fs';
import {generateScript} from '../scriptGenerator/generateScript';
import {waitForInitialScanCompletion} from './waitForInitialScanCompletion';
import {minifyScripts} from '../minifier/minifyScripts';

export class Session {

    public readonly configuration: Readonly<ISessionConfiguration>;

    protected watcher?: chokidar.FSWatcher;

    protected processedFiles: Set<string>;

    protected initialTask: Array<Promise<void>> | null;

    public constructor(parameters: ISessionOptions = {}) {
        this.configuration = getSessionConfiguration(parameters);
        this.processedFiles = new Set();
        this.initialTask = null;
    }

    public async start(): Promise<void> {
        await this.outputHelperScript();
        await this.startWatcher();
    }

    public async stop(): Promise<void> {
        await this.stopWatcher();
    }

    public async outputHelperScript() {
        const srcDirectory = path.join(__dirname, '..', 'helper');
        await copyFile(
            path.join(srcDirectory, `index${this.configuration.ext}`),
            this.configuration.helper,
        );
    }

    public async processCSS(
        filePath: string,
    ): Promise<void> {
        const postcssResult = await parseCSS({
            plugins: this.configuration.postcssPlugins,
            file: filePath,
        });
        const pluginResult = extractPluginResult(postcssResult);
        const scriptPath = path.join(`${filePath}${this.configuration.ext}`);
        this.processedFiles.add(filePath);
        await writeFile(
            scriptPath,
            generateScript(
                scriptPath,
                this.configuration.helper,
                pluginResult,
                postcssResult.root,
            ),
            this.configuration.stdout,
        );
    }

    public async minifyScripts() {
        await minifyScripts(
            this.configuration.helper,
            [...this.processedFiles].map((file) => `${file}${this.configuration.ext}`),
        );
    }

    protected async startWatcher(): Promise<void> {
        this.stopWatcher();
        this.initialTask = [];
        this.log(`watching: ${this.configuration.path.join(', ')}`);
        const watcher = this.watcher = chokidar.watch(
            this.configuration.path.slice(),
            this.configuration.chokidar,
        )
        .on('error', this.onError.bind(this))
        .on('all', (eventName, file, stats) => {
            if (this.configuration.extensions.has(path.extname(file))) {
                this.onFileEvent(eventName, file, stats);
            } else {
                watcher.unwatch(file);
            }
        });
        await waitForInitialScanCompletion(this.watcher);
        await Promise.all(this.initialTask);
        this.initialTask = null;
        if (!this.configuration.watch) {
            await this.minifyScripts();
            await this.stop();
        }
    }

    protected log(...messages: Parameters<typeof write>[1]): void {
        write(this.configuration.stdout, messages);
    }

    protected logError(...messages: Parameters<typeof write>[1]): void {
        write(this.configuration.stderr, messages);
    }

    protected stopWatcher(): void {
        if (this.watcher) {
            this.watcher.close();
            delete this.watcher;
        }
    }

    protected onError(error: Error): void {
        this.logError(error);
    }

    protected onFileEvent(
        eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir',
        file: string,
        stats?: fs.Stats,
    ): void {
        this.log(`[${eventName}] ${file}`);
        switch (eventName) {
        case 'add': {
            const promise = this.onAdd(file, stats);
            if (this.initialTask) {
                this.initialTask.push(promise);
            }
            break;
        }
        case 'change':
            this.onChange(file, stats);
            break;
        case 'unlink':
            this.onUnlink(file);
            break;
        default:
        }
    }

    protected onAdd(
        file: string,
        stats?: fs.Stats,
    ): Promise<void> {
        return this.onChange(file, stats);
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
        await this.processCSS(file);
    }

    protected async onUnlink(
        file: string,
    ): Promise<void> {
        const scriptPath = path.join(`${file}${this.configuration.ext}`);
        this.processedFiles.delete(file);
        await deleteFile(scriptPath, this.configuration.stdout);
    }

}
