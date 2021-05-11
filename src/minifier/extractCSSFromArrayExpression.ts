import type {Node} from './walker';
import {isArrayExpression, isObjectExpression} from './ast';
import type {CSSRange} from './types';

export const extractCSSFromArrayExpression = (
    node: Node,
    cssKey: string,
): Array<CSSRange> => {
    const result: Array<CSSRange> = [];
    if (isArrayExpression(node)) {
        for (const item of node.elements) {
            if (isObjectExpression(item)) {
                for (const {key, value} of item.properties) {
                    if (key.name === cssKey) {
                        if (value.type === 'Literal') {
                            const css = value.value;
                            if (typeof css === 'string') {
                                result.push({css, start: item.start, end: item.end});
                            } else {
                                throw new Error(`InvalidCSSType: ${JSON.stringify(css)}`);
                            }
                        } else {
                            throw new Error(`NonLiteral: ${JSON.stringify(value)}`);
                        }
                    }
                }
            }
        }
    }
    return result;
};
