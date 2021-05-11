import test from 'ava';
import {getOutputOption} from './getOutputOption';

interface Test {
    input: Parameters<typeof getOutputOption>,
    expected: ReturnType<typeof getOutputOption> | null,
}

([
    {
        input: [{}, ['a']],
        expected: {type: 'script', path: 'helper.ypeBEsobvcr6wjGzmiPcTaeG7_gUfE5yuYB3ha_uSLs.css.js'},
    },
    {
        input: [{helper: 'output.js'}, ['a']],
        expected: {type: 'script', path: 'output.js'},
    },
    {
        input: [{helper: 'output.ts'}, ['a']],
        expected: {type: 'script', path: 'output.ts'},
    },
    {
        input: [{css: 'output.css'}, ['a']],
        expected: {type: 'css', path: 'output.css'},
    },
    {
        input: [{css: 'output.css', helper: 'output.js'}, ['a']],
        expected: null,
    },
] as Array<Test>).forEach(({input, expected}, index) => {
    test(`#${index} ${JSON.stringify(input)} → ${expected ? JSON.stringify(expected) : 'Error'}`, (t) => {
        if (expected) {
            t.deepEqual(getOutputOption(...input), expected);
        } else {
            t.throws(() => getOutputOption(...input));
        }
    });
});
