import * as path from 'path';
import type {SessionConfiguration} from './types';

export const getExtensionOption = (
    parameters: {ext?: string},
    output: SessionConfiguration['output'],
): string => {
    let {ext} = parameters;
    if (!ext) {
        if (output.type === 'script') {
            ext = path.extname(output.path);
        }
        if (!ext) {
            ext = '.js';
        }
    }
    return ext;
};
