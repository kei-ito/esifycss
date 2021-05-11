import type * as postcss from 'postcss';
import type {EsifyCSSResult, Imports, PluginMangler} from './types';
import {getMatchedImport} from './getMatchedImport';

export const mangleKeyFrames = (
    {id, root, mangler, imports, rawPrefix}: {
        id: string,
        root: postcss.Root,
        mangler: PluginMangler,
        imports: Imports,
        rawPrefix: string,
    },
): EsifyCSSResult['keyframes'] => {
    const keyframes: EsifyCSSResult['keyframes'] = {};
    root.walkAtRules((rule) => {
        const {name} = rule;
        if (name === 'keyframes') {
            const {params: before} = rule;
            if (before) {
                let after = before;
                if (before.startsWith(rawPrefix)) {
                    after = before.slice(rawPrefix.length);
                } else {
                    const imported = getMatchedImport(before, imports);
                    if (imported) {
                        after = mangler(imported.from, name, imported.key);
                    } else {
                        after = mangler(id, name, before);
                    }
                }
                rule.params = keyframes[before] = after;
            }
        }
    });
    return keyframes;
};
