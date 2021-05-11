import * as fs from 'fs';
import type {CSSParserParameters, CSSParserConfigurations} from './types';
const {readFile} = fs.promises;

export const getCSSParserConfiguration = async (
    parameters: CSSParserParameters,
): Promise<CSSParserConfigurations> => ({
    css: `${parameters.css || await readFile(parameters.file)}`,
    plugins: parameters.plugins,
    options: {
        ...parameters.options,
        from: parameters.file,
        map: parameters.map || {},
    },
});
