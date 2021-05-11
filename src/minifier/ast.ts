import type {Node} from 'acorn';
import type {Program, ObjectExpression, ArrayExpression} from './walker';

export const isProgramNode = (node: Node): node is Program => node.type === 'Program';
export const isObjectExpression = (node: Node): node is ObjectExpression => node.type === 'ObjectExpression';
export const isArrayExpression = (node: Node): node is ArrayExpression => node.type === 'ArrayExpression';
