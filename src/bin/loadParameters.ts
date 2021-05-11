import * as path from 'path';
import * as fs from 'fs';
import type {SessionOptions} from '../runner/types.js';
const {readFile} = fs.promises;

interface EsifyCSSCommandOptions {
    exclude: Array<string>,
    helper: string,
    config: string,
    noMangle: boolean,
    watch: boolean,
    css: string,
    ext: string,
}

export const loadParameters = async (
    include: Array<string>,
    args: EsifyCSSCommandOptions,
    directory: string = process.cwd(),
): Promise<SessionOptions> => {
    const parameters: Partial<SessionOptions> = {
        include,
        helper: args.helper,
        css: args.css,
        ext: args.ext,
        exclude: args.exclude,
        esifycssPluginParameter: {
            mangle: !args.noMangle,
        },
        watch: args.watch,
    };
    if (args.config) {
        const configPath = path.isAbsolute(args.config) ? args.config : path.join(directory, args.config);
        const configJSON = await readFile(configPath, 'utf8');
        Object.assign(parameters, JSON.parse(configJSON) as SessionOptions);
    }
    return parameters;
};
