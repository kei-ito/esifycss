import * as path from 'path';
import type * as postcss from 'postcss';
import type {EsifyCSSResult} from '../postcssPlugin/types';

const getCSS = (
    node: postcss.ChildNode,
): string => {
    const css = node.toString();
    return css.endsWith('}') ? css : `${css};`;
};

export const generateScript = (
    /**
     * Returns a (TypeScript-compatible) JavaScript code that exports className,
     * id, keyframes. The script contains addStyle(...) lines that insert CSS rules
     * to the document.
     */
    props: {
        /** The destination of the output. The relative path to the helper script is calculated from this value. */
        output: string,
        /** Path to the helperScript which is required to get a relative path to the helper script. */
        helper: string,
        /** The main contents of the output script. */
        result: EsifyCSSResult,
        /** The root node will be splitted into rules that can be passed to insertRule. */
        root: postcss.Root,
        cssKey: string,
    },
): string => {
    let helperPath = path.relative(path.dirname(props.output), props.helper);
    helperPath = helperPath.replace(/\.ts$/, '');
    if (!path.isAbsolute(helperPath)) {
        helperPath = `./${path.normalize(helperPath)}`.replace(/^\.\/\.\./, '..');
    }
    return [
        `import {addStyle} from '${helperPath.split(path.sep).join('/')}';`,
        `addStyle([${props.root.nodes.map((node) => `{${props.cssKey}: ${JSON.stringify(getCSS(node))}}`).join(',')}]);`,
        `export const className = ${JSON.stringify(props.result.className, null, 4)};`,
        `export const id = ${JSON.stringify(props.result.id, null, 4)};`,
        `export const keyframes = ${JSON.stringify(props.result.keyframes, null, 4)};`,
        '',
    ].join('\n');
};
