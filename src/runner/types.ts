import type {Matcher} from 'anymatch';
import type {AwaitWriteFinishOptions, WatchOptions} from 'chokidar';
import type {Writable} from 'stream';
import type {AcceptedPlugin, ProcessOptions, SourceMapOptions} from 'postcss';
import type {PluginOptions} from '../postcssPlugin/types';

export interface SessionOptions {
    /**
     * Pattern(s) to be included
     * @default "*"
     */
    include?: Array<string> | string,
    /**
     * Pattern(s) to be excluded.
     * @default ['node_modules']
     */
    exclude?: Matcher,
    /**
     * File extension(s) to be included.
     * @default ['.css']
     */
    extensions?: Array<string>,
    /**
     * Where this plugin outputs the helper script.
     * If you use TypeScript, set a  value like '*.ts'.
     * You can't use this option with the css option.
     * The {hash} in the default value is calculated from the include option.
     * @default "helper.{hash}.css.js"
     */
    helper?: string,
    /**
     * File extension of generated script.
     * @default options.helper ? path.extname(options.helper) : '.js'
     */
    ext?: string,
    /**
     * Where this plugin outputs the css.
     * You can't use this option with the helper option.
     * @default undefined
     */
    css?: string,
    /**
     * It it is true, a watcher is enabled.
     * @default false
     */
    watch?: boolean,
    /**
     * Options passed to chokidar.
     * You can't set ignoreInitial to true.
     * @default {
     *   ignore: exclude,
     *   ignoreInitial: false,
     *   useFsEvents: false,
     * }
     */
    chokidar?: WatchOptions,
    /**
     * An array of postcss plugins.
     * esifycss.plugin is appended to this array.
     * @default []
     */
    postcssPlugins?: Array<AcceptedPlugin>,
    /**
     * https://github.com/postcss/postcss#options
     * @default undefined
     */
    postcssOptions?: ProcessOptions,
    /**
     * Parameters for esifycss.plugin.
     */
    esifycssPluginParameter?: PluginOptions,
    /**
     * A stream where the runner outputs logs.
     * @default process.stdout
     */
    stdout?: Writable,
    /**
     * A stream where the runner outputs errorlogs.
     * @default process.stderr
     */
    stderr?: Writable,
}

export interface ReadonlyWatchOptions extends Readonly<WatchOptions> {
    awaitWriteFinish?: Readonly<AwaitWriteFinishOptions> | boolean,
}

export interface SessionOutput {
    type: 'css' | 'script',
    path: string,
}

export interface SessionConfiguration {
    readonly watch: boolean,
    readonly output: SessionOutput,
    readonly ext: string,
    readonly path: ReadonlyArray<string>,
    readonly chokidar: ReadonlyWatchOptions,
    readonly stdout: Writable,
    readonly stderr: Writable,
    readonly postcssPlugins: Array<AcceptedPlugin>,
    readonly postcssOptions: ProcessOptions,
    readonly cssKey: string,
}

export interface CSSParserParameters {
    file: string,
    css?: Buffer | string,
    options?: ProcessOptions,
    plugins: Array<AcceptedPlugin>,
    map?: SourceMapOptions,
}

export interface CSSParserConfigurations {
    readonly css: string,
    readonly plugins: Array<AcceptedPlugin>,
    readonly options: {
        readonly from: string,
        readonly map: SourceMapOptions,
    },
}
