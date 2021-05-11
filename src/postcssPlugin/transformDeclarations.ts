import type * as postcss from 'postcss';
import * as parser from '@hookun/parse-animation-shorthand';
import type {EsifyCSSResult, Imports, PluginMangler} from './types';
import {getMatchedImport} from './getMatchedImport';

export const transformDeclarations = (
    {root, transformResult, mangler, imports, rawPrefix}: {
        root: postcss.Root,
        transformResult: EsifyCSSResult,
        mangler: PluginMangler,
        imports: Imports,
        rawPrefix: string,
    },
): void => {
    const getRenamed = (name: string): string | undefined => {
        if (name.startsWith(rawPrefix)) {
            return name.slice(rawPrefix.length);
        }
        const imported = getMatchedImport(name, imports);
        if (imported) {
            return mangler(imported.from, 'keyframes', imported.key);
        }
        return transformResult.keyframes[name];
    };
    root.walkDecls((declaration) => {
        const {prop} = declaration;
        if (prop === 'animation-name') {
            const renamed = getRenamed(declaration.value);
            if (renamed) {
                declaration.value = renamed;
            }
        } else if (prop === 'animation') {
            const animations: Array<string> = [];
            for (const animation of parser.parse(declaration.value)) {
                const renamed = getRenamed(animation.name);
                if (renamed) {
                    animation.name = renamed;
                }
                animations.push(parser.serialize(animation));
            }
            declaration.value = animations.join(',');
        }
    });
};
