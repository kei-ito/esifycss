import * as path from 'path';
import {ISessionOptions} from '../runner/types.js';
import {readFile} from '../util/fs';
import {IEsifyCSSCommand} from './types';

export const loadParameters = async (
    program: IEsifyCSSCommand,
    directory: string = process.cwd(),
): Promise<ISessionOptions> => {
    const parameters: Partial<ISessionOptions> = {
        include: program.args,
        helper: program.helper,
        css: program.css,
        exclude: program.exclude,
        esifycssPluginParameter: {
            mangle: !program.noMangle,
        },
        watch: program.watch,
    };
    if (program.config) {
        const configPath = path.isAbsolute(program.config) ? program.config : path.join(directory, program.config);
        const configJSON = await readFile(configPath, 'utf8');
        Object.assign(parameters, JSON.parse(configJSON) as ISessionOptions);
    }
    return parameters;
};
