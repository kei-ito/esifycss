import type * as acorn from 'acorn';

export type NodeType = 'ArrayExpression' | 'ArrayPattern' | 'ArrowFunctionExpression' | 'AssignmentExpression' | 'AssignmentPattern' | 'AwaitExpression' | 'BinaryExpression' | 'BlockStatement' | 'BreakStatement' | 'CallExpression' | 'CatchClause' | 'ClassBody' | 'ClassDeclaration' | 'ClassExpression' | 'ConditionalExpression' | 'ContinueStatement' | 'DebuggerStatement' | 'DoWhileStatement' | 'EmptyStatement' | 'ExportAllDeclaration' | 'ExportDefaultDeclaration' | 'ExportNamedDeclaration' | 'ExportSpecifier' | 'ExpressionStatement' | 'ForInStatement' | 'ForOfStatement' | 'ForStatement' | 'FunctionDeclaration' | 'FunctionExpression' | 'Identifier' | 'IfStatement' | 'ImportDeclaration' | 'ImportDefaultSpecifier' | 'ImportNamespaceSpecifier' | 'ImportSpecifier' | 'LabeledStatement' | 'Literal' | 'LogicalExpression' | 'MemberExpression' | 'MetaProperty' | 'MethodDefinition' | 'NewExpression' | 'ObjectExpression' | 'ObjectPattern' | 'ParenthesizedExpression' | 'Program' | 'Property' | 'RestElement' | 'ReturnStatement' | 'SequenceExpression' | 'SpreadElement' | 'Super' | 'SwitchCase' | 'SwitchStatement' | 'TaggedTemplateExpression' | 'TemplateElement' | 'TemplateLiteral' | 'ThisExpression' | 'ThrowStatement' | 'TryStatement' | 'UnaryExpression' | 'UpdateExpression' | 'VariableDeclaration' | 'VariableDeclarator' | 'WhileStatement' | 'WithStatement' | 'YieldExpression';

interface Node extends acorn.Node {
    type: NodeType,
    key?: Identifier,
    value?: Node | boolean | number | string | null,
}

interface Literal extends Node {
    type: 'Literal',
    raw: string,
    value: boolean | number | string | null,
}

interface StringLiteral extends Literal {
    value: string,
}

interface Identifier extends Node {
    type: 'Identifier',
    name: string,
}

interface CallExpression extends Node {
    type: 'CallExpression',
    callee?: Identifier,
    arguments: Array<Node>,
}

interface ExpressionStatement extends Node {
    type: 'ExpressionStatement',
    expression: CallExpression,
}

interface ImportSpecifier extends Node {
    type: 'ImportSpecifier',
    imported: Identifier,
    local: Identifier,
}

interface ImportDeclaration extends Node {
    type: 'ImportDeclaration',
    specifiers: Array<ImportSpecifier>,
    source: StringLiteral,
}

interface VariableDeclarator extends Node {
    type: 'VariableDeclaration',
    id: Identifier,
}

interface VariableDeclaration extends Node {
    type: 'VariableDeclaration',
    declarations: Array<VariableDeclarator>,
}

interface FunctionDeclaration extends Node {
    type: 'FunctionDeclaration',
    id: Identifier,
}

interface MemberExpression extends Node {
    type: 'MemberExpression',
    key: Identifier,
    value: Node,
}

interface ObjectExpression extends Node {
    type: 'ObjectExpression',
    properties: Array<MemberExpression>,
}

interface ArrayExpression extends Node {
    type: 'ArrayExpression',
    elements: Array<Node>,
}

interface Program extends Node {
    type: 'Program',
    body: Array<ExpressionStatement | FunctionDeclaration | ImportDeclaration | VariableDeclaration>,
}

interface Visitors {
    ImportDeclaration?: (node: ImportDeclaration) => void,
    ExpressionStatement?: (node: ExpressionStatement) => void,
    ObjectExpression?: (node: ObjectExpression) => void,
}

export const simple: (
    ast: acorn.Node,
    visitors: Visitors,
) => void;

export const base: Record<string, () => void>;
