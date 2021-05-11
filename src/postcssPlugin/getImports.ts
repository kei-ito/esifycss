import type * as postcss from 'postcss';
import {parseImport} from './parseImport';
import type {Imports} from './types';

export const getImports = (
    root: postcss.Root,
    id: string,
): Imports => {
    const imports: Imports = new Map();
    root.walkAtRules((rule) => {
        const {name} = rule;
        if (name === 'import') {
            const parsed = parseImport(rule.params, id);
            if (parsed) {
                imports.set(parsed.localName, parsed.from);
                rule.remove();
            }
        }
        Object.assign(rule.raws, {before: '', between: '', after: ''});
    });
    return imports;
};
