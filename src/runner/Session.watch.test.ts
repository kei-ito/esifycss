import * as path from 'path';
import * as fs from 'fs';
import type {TestInterface} from 'ava';
import anyTest from 'ava';
import * as stream from 'stream';
import * as events from 'events';
import type * as postcss from 'postcss';
import * as parser from '@hookun/parse-animation-shorthand';
import {Session} from './Session';
import {createTemporaryDirectory} from '../util/createTemporaryDirectory';
import {runCode} from '../util/runCode.for-test';
import {deleteFile} from '../util/deleteFile';
import {writeFilep} from '../util/writeFilep';
const {stat} = fs.promises;

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

test('watch', async (t) => {
    const cssPath = path.join(t.context.directory, '/components/style.css');
    const helper = path.join(t.context.directory, 'helper.js');
    const codePath = `${cssPath}${path.extname(helper)}`;
    const messageListener = new events.EventEmitter();
    const waitForMessage = async (
        expected: RegExp | string,
    ) => await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error(`Timeout: waiting ${expected}`)), 1000);
        const onData = (message: string) => {
            if (typeof expected === 'string' ? message.includes(expected) : expected.test(message)) {
                clearTimeout(timeoutId);
                messageListener.removeListener('message', onData);
                resolve();
            }
        };
        messageListener.on('message', onData);
    });
    const writable = new stream.Writable({
        write(chunk, _encoding, callback) {
            const message = `${chunk}`.trim();
            messageListener.emit('message', message);
            t.log(message);
            callback();
        },
    });
    t.context.session = new Session({
        helper,
        watch: true,
        include: t.context.directory,
        stdout: writable,
        stderr: writable,
    });
    await writeFilep(cssPath, [
        '@keyframes foo {0%{color:red}100%{color:green}}',
        '.foo#bar {animation: 1s 0.5s linear infinite foo}',
    ].join(''));
    t.context.session.start().catch(t.fail);
    await waitForMessage(`written: ${codePath}`);
    const result1 = await runCode(codePath);
    await writeFilep(cssPath, [
        '@keyframes foo {0%{color:red}100%{color:green}}',
        '.foo#bar {animation: 2s 1s linear infinite foo}',
    ].join(''));
    await waitForMessage(`written: ${codePath}`);
    const result2 = await runCode(codePath);
    await deleteFile(cssPath);
    await waitForMessage(`deleted: ${codePath}`);
    await t.throwsAsync(async () => await stat(codePath), {code: 'ENOENT'});
    t.deepEqual(result1.className, result2.className);
    t.deepEqual(result1.id, result2.id);
    t.deepEqual(result1.keyframes, result2.keyframes);
    const nodes1 = result1.root.nodes || [];
    const nodes2 = result2.root.nodes || [];
    {
        const atRule1 = nodes1[0] as postcss.AtRule;
        const atRule2 = nodes2[0] as postcss.AtRule;
        t.is(atRule1.name, 'keyframes');
        t.is(atRule2.name, 'keyframes');
        t.is(atRule1.params, result1.keyframes.foo);
        t.is(atRule1.params, result1.keyframes.foo);
    }
    {
        const rule1 = nodes1[1] as postcss.Rule;
        const rule2 = nodes2[1] as postcss.Rule;
        t.is(rule1.selector, `.${result1.className.foo}#${result1.id.bar}`);
        t.is(rule2.selector, `.${result1.className.foo}#${result1.id.bar}`);
        const declarations1 = (rule1.nodes || []) as Array<postcss.Declaration>;
        const declarations2 = (rule2.nodes || []) as Array<postcss.Declaration>;
        t.is(declarations1.length, 1);
        t.is(declarations1[0].prop, 'animation');
        t.is(declarations2.length, 1);
        t.is(declarations2[0].prop, 'animation');
        t.deepEqual(
            parser.parse(declarations1[0].value),
            parser.parse(`1s 0.5s linear infinite ${result1.keyframes.foo}`),
        );
        t.deepEqual(
            parser.parse(declarations2[0].value),
            parser.parse(`2s 1s linear infinite ${result1.keyframes.foo}`),
        );
    }
});
