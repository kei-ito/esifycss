import * as path from 'path';
import * as fs from 'fs';
import * as stream from 'stream';
import * as postcss from 'postcss';
import type {TestInterface} from 'ava';
import anyTest from 'ava';
import {Session} from './Session';
import {createTemporaryDirectory} from '../util/createTemporaryDirectory';
import {runCode} from '../util/runCode.for-test';
import {writeFilep} from '../util/writeFilep';
const {readFile} = fs.promises;

interface TestContext {
    directory: string,
    session?: Session,
}

const test = anyTest as TestInterface<TestContext>;
const isRule = (input: postcss.ChildNode): input is postcss.Rule => input.type === 'rule';

test.beforeEach(async (t) => {
    t.context.directory = await createTemporaryDirectory();
});

test.afterEach(async (t) => {
    if (t.context.session) {
        await t.context.session.stop();
    }
});

test('#css', async (t) => {
    const files = [
        {
            path: 'input1.css',
            content: [
                '.a1 {color: a1; width: 10%}',
                '.b1 {color: b1; width: 20%}',
            ],
        },
        {
            path: 'input2.css',
            content: [
                '@charset "utf-8";',
                '.a2 {color: a2; width: 30%}',
                '.b2 {color: b2; width: 40%}',
            ],
        },
    ];
    await Promise.all(files.map(async (file) => {
        await writeFilep(
            path.join(t.context.directory, file.path),
            file.content.join('\n'),
        );
    }));
    const cssPath = path.join(t.context.directory, 'output.css');
    const writable = new stream.Writable({
        write(chunk, _encoding, callback) {
            t.log(`${chunk}`.trim());
            callback();
        },
    });
    const session = t.context.session = new Session({
        css: cssPath,
        include: t.context.directory,
        watch: false,
        stdout: writable,
        stderr: writable,
    });
    await session.start();
    const result1 = await runCode(path.join(t.context.directory, 'input1.css.js'));
    t.deepEqual(result1.className, {
        a1: '_0',
        b1: '_1',
    });
    const result2 = await runCode(path.join(t.context.directory, 'input2.css.js'));
    t.deepEqual(result2.className, {
        a2: '_2',
        b2: '_3',
    });
    const resultCSS = await readFile(cssPath, 'utf8');
    t.log(`==== resultCSS ====\n${resultCSS}\n===================`);
    const root = postcss.parse(resultCSS);
    t.log(root.toJSON());
    t.truthy(root.nodes.find((node) => isRule(node) && node.selector === `.${result1.className.a1}`));
    t.truthy(root.nodes.find((node) => isRule(node) && node.selector === `.${result1.className.b1}`));
    t.truthy(root.nodes.find((node) => isRule(node) && node.selector === `.${result2.className.a2}`));
    t.truthy(root.nodes.find((node) => isRule(node) && node.selector === `.${result2.className.b2}`));
});
