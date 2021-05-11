export interface Range {
    start: number,
    end: number,
}

export interface CSSRange extends Range {
    css: string,
}

export interface ParseResult {
    ranges: Array<CSSRange>,
    statements: Array<Range>,
}

export interface ScriptData extends ParseResult {
    script: string,
}

export interface ParseScriptsResult {
    scripts: Map<string, ScriptData>,
    tokens: Map<string, number>,
}
