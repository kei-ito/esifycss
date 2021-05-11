import * as path from 'path';
import * as stream from 'stream';
import type {TestInterface, ExecutionContext} from 'ava';
import anyTest from 'ava';
import type * as postcss from 'postcss';
import * as scss from 'postcss-scss';
import * as parser from '@hookun/parse-animation-shorthand';
import type {SessionOptions} from './types';
import {Session} from './Session';
import {createTemporaryDirectory} from '../util/createTemporaryDirectory';
import type {RunCodeResult} from '../util/runCode.for-test';
import {runCode} from '../util/runCode.for-test';
import {writeFilep} from '../util/writeFilep';

interface TestContext {
    directory: string,
    session?: Session,
}

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(async (t) => {
    t.context.directory = await createTemporaryDirectory();
});

test.afterEach(async (t) => {
    if (t.context.session) {
        await t.context.session.stop();
    }
});

interface Test {
    parameters: Partial<SessionOptions>,
    files: Array<{
        path: string,
        content: Array<string>,
        test: (
            t: ExecutionContext<TestContext>,
            result: RunCodeResult,
        ) => void,
    }>,
}

([
    {
        parameters: {},
        files: [
            {
                path: '/components/style.css',
                content: [
                    '.foo {color: red}',
                ],
                test: (t, {className, id, keyframes, root}) => {
                    t.deepEqual(Object.keys(id), []);
                    t.deepEqual(Object.keys(className), ['foo']);
                    t.deepEqual(Object.keys(keyframes), []);
                    const [ruleNode, anotherNode] = root.nodes as Array<postcss.Rule>;
                    t.is(anotherNode, undefined);
                    t.like(ruleNode, {
                        type: 'rule',
                        selector: `.${className.foo}`,
                    });
                    const [declaration, anotherDeclaration] = ruleNode.nodes;
                    t.is(anotherDeclaration, undefined);
                    t.like(declaration, {
                        type: 'decl',
                        prop: 'color',
                        value: 'red',
                    });
                },
            },
        ],
    },
    {
        parameters: {},
        files: [
            {
                path: '/components/style.css',
                content: [
                    '@charset "UTF-8";',
                    '.foo {color: blue}',
                ],
                test: (t, {className, id, keyframes, root}) => {
                    t.deepEqual(Object.keys(id), []);
                    t.deepEqual(Object.keys(className), ['foo']);
                    t.deepEqual(Object.keys(keyframes), []);
                    const [ruleNode, anotherNode] = root.nodes as Array<postcss.Rule>;
                    t.is(anotherNode, undefined);
                    t.like(ruleNode, {
                        type: 'rule',
                        selector: `.${className.foo}`,
                    });
                    const [declaration, anotherDeclaration] = ruleNode.nodes;
                    t.is(anotherDeclaration, undefined);
                    t.like(declaration, {
                        type: 'decl',
                        prop: 'color',
                        value: 'blue',
                    });
                },
            },
        ],
    },
    {
        parameters: {},
        files: [
            {
                path: '/components/style.css',
                content: [
                    '@keyframes foo {0%{color: red}100%{color:green}}',
                    '@keyframes bar {0%{color: red}100%{color:green}}',
                    '.foo#bar {animation: 1s 0.5s linear infinite foo, 1s 0.5s ease 5 bar}',
                ],
                test: (t, {className, id, keyframes, root}) => {
                    t.deepEqual(Object.keys(id), ['bar']);
                    t.deepEqual(Object.keys(className), ['foo']);
                    t.deepEqual(Object.keys(keyframes), ['foo', 'bar']);
                    t.is(root.nodes.length, 3);
                    t.like(root.nodes[0], {
                        type: 'atrule',
                        name: 'keyframes',
                        params: keyframes.foo,
                    });
                    t.like(root.nodes[1], {
                        type: 'atrule',
                        name: 'keyframes',
                        params: keyframes.bar,
                    });
                    {
                        const node = root.nodes[2] as postcss.Rule;
                        t.like(node, {
                            type: 'rule',
                            selector: `.${className.foo}#${id.bar}`,
                        });
                        const declarations = node.nodes as Array<postcss.Declaration>;
                        t.is(declarations.length, 1);
                        t.is(declarations[0].prop, 'animation');
                        t.deepEqual(
                            parser.parse(declarations[0].value),
                            parser.parse([
                                `1s 0.5s linear infinite ${keyframes.foo}`,
                                `1s 0.5s ease 5 ${keyframes.bar}`,
                            ].join(',')),
                        );
                    }
                },
            },
        ],
    },
    {
        parameters: {
            postcssOptions: {parser: scss.parse},
            extensions: ['.scss', '.css'],
        },
        files: [
            {
                path: '/components/style.scss',
                content: [
                    '.foo#bar {&>.baz {color: red}}',
                ],
                test: (t, {className, id, keyframes}) => {
                    t.deepEqual(Object.keys(id), ['bar']);
                    t.deepEqual(Object.keys(className), ['foo', 'baz']);
                    t.deepEqual(Object.keys(keyframes), []);
                },
            },
        ],
    },
] as Array<Test>).forEach(({parameters, files}, index) => {
    test.serial(`#${index}`, async (t) => {
        await Promise.all(files.map(async (file) => {
            const filePath = path.join(t.context.directory, file.path);
            await writeFilep(filePath, file.content.join('\n'));
        }));
        const helper = path.join(t.context.directory, 'helper.js');
        const writable = new stream.Writable({
            write(chunk, _encoding, callback) {
                t.log(`${chunk}`.trim());
                callback();
            },
        });
        const session = t.context.session = new Session({
            ...parameters,
            include: t.context.directory,
            helper,
            watch: false,
            stdout: writable,
            stderr: writable,
        });
        await session.start();
        const identifiers = new Map<string, string>();
        await Promise.all(files.map(async (file) => {
            const name = `${file.path}${path.extname(helper)}`;
            const result = await runCode(path.join(t.context.directory, name));
            for (const map of [result.className, result.id, result.keyframes]) {
                for (const [key, value] of Object.entries(map)) {
                    if (value) {
                        t.false(identifiers.has(value), `${key}: ${value} is conflicted`);
                        identifiers.set(value, key);
                    }
                }
            }
            file.test(t, result);
        }));
    });
});
