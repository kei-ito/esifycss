import * as path from 'path';
import * as vm from 'vm';
import * as rollup from 'rollup';
import * as postcss from 'postcss';
import {createSandbox} from '../util/createSandbox.for-test';
import type {EsifyCSSResult} from '../postcssPlugin/types';
import {writeFilep} from './writeFilep';

export interface RunCodeResult extends EsifyCSSResult {
    root: postcss.Root,
}

export const runCode = async (file: string): Promise<RunCodeResult> => {
    const testCodePath = `${file}-import.js`;
    await writeFilep(testCodePath, `import * as imported from './${path.basename(file)}';exports = imported;`);
    const bundle = await rollup.rollup({input: testCodePath});
    const {output: [output, undef]} = await bundle.generate({format: 'es'});
    if (undef) {
        if ('code' in undef) {
            throw new Error(`Unexpected multiple outputs: ${undef.code}`);
        } else {
            throw new Error(`Unexpected multiple outputs: ${JSON.stringify(undef, null, 2)}`);
        }
    }
    const sandbox = createSandbox<EsifyCSSResult>();
    vm.runInNewContext(output.code, sandbox);
    const {exports: {className = {}, id = {}, keyframes = {}}} = sandbox;
    return {className, id, keyframes, root: postcss.parse(sandbox.document.css)};
};
