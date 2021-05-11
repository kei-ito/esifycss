import test from 'ava';
import {ensureArray} from './ensureArray';

interface Test {
    input: Array<number> | number,
    expected: Array<number>,
}

([
    {input: 0, expected: [0]},
    {input: [0], expected: [0]},
    {input: [0, 1], expected: [0, 1]},
] as Array<Test>).forEach(({input, expected}, index) => {
    test(`#${index} ensureArray(${JSON.stringify(input)}) → ${JSON.stringify(expected)}`, (t) => {
        t.deepEqual(
            ensureArray(input),
            expected,
        );
    });
});
