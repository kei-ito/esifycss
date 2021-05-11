import type * as postcss from 'postcss';
import * as selectorParser from 'postcss-selector-parser';
import type {EsifyCSSResult, Imports, PluginMangler} from './types';
import {getMatchedImport} from './getMatchedImport';

export const mangleIdentifiers = async (
    {id, root, mangler, imports, rawPrefix}: {
        id: string,
        root: postcss.Root,
        mangler: PluginMangler,
        imports: Imports,
        rawPrefix: string,
    },
): Promise<{id: EsifyCSSResult['id'], className: EsifyCSSResult['className']}> => {
    const result: {id: EsifyCSSResult['id'], className: EsifyCSSResult['className']} = {
        id: {},
        className: {},
    };
    const parser = selectorParser((selectors) => {
        selectors.walk((selector) => {
            if (selectorParser.isClassName(selector) || selectorParser.isIdentifier(selector)) {
                const {value: before} = selector;
                let after = before;
                if (before.startsWith(rawPrefix)) {
                    after = before.slice(rawPrefix.length);
                } else {
                    const imported = getMatchedImport(before, imports);
                    if (imported) {
                        after = mangler(imported.from, selector.type, imported.key);
                    } else {
                        after = mangler(id, selector.type, before);
                    }
                }
                const type = selector.type === 'id' ? 'id' : 'className';
                selector.value = result[type][before] = after;
            }
        });
    });
    const processes: Array<Promise<void>> = [];
    root.walkRules((rule) => {
        processes.push(parser.process(rule.selector).then((newSelector) => {
            rule.selector = newSelector;
        }));
    });
    await Promise.all(processes);
    return result;
};
