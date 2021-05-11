import type {IdGenerator} from '../util/createIdGenerator';

export interface PluginOptions {
    /**
     * When it is true, this plugin minifies classnames.
     * @default true
     */
    mangle?: boolean,
    /**
     * A function returns an unique number from a given file id. If you process
     * CSS files in multiple postcss processes, you should create an identifier
     * outside the processes and pass it as this value to keep the uniqueness
     * of mangled outputs.
     * @default esifycss.createIdentifier()
     */
    identifier?: IdGenerator,
    /**
     * Names starts with this value are not passed to mangler but replaced with
     * unprefixed names.
     * @default "raw-"
     */
    rawPrefix?: string,
    /**
     * A custom mangler: (*id*, *type*, *name*) => string.
     * - *id*: string. A filepath to the CSS.
     * - *type*: 'id' | 'class' | 'keyframes'. The type of *name*
     * - *name*: string. An identifier in the style.
     *
     * If mangler is set, `mangle` and `identifier` options are ignored.
     *
     * For example, If the plugin processes `.foo{color:green}` in `/a.css`,
     * The mangler is called with `("/a.css", "class", "foo")`. A mangler should
     * return an unique string for each input pattern or the styles will be
     * overwritten unexpectedly.
     * @default undefined
     */
    mangler?: PluginMangler,
}

export interface PluginMangler {
    (
        id: string,
        type: string,
        name: string,
    ): string,
}

export interface PluginConfiguration {
    readonly mangler: PluginMangler,
    readonly rawPrefix: string,
}

export type IdentifierMap = Record<string, string | undefined>;

export interface EsifyCSSResult {
    className: IdentifierMap,
    id: IdentifierMap,
    keyframes: IdentifierMap,
}

export interface Imports extends Map<string, string> {}
