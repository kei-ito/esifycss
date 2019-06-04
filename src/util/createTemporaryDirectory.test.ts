import test from 'ava';
import {createTemporaryDirectory} from './createTemporaryDirectory';

interface ITest {
    prefix?: string,
    expected: RegExp,
}

([
    {expected: /node-tmp-/},
    {prefix: 'foo-temporary-', expected: /foo-temporary-/},
] as Array<ITest>).forEach(({prefix, expected}) => {
    test(`createTemporaryDirectory(${JSON.stringify(prefix)}) → ${JSON.stringify(expected)}`, async (t) => {
        const actual = await createTemporaryDirectory(prefix);
        t.true(expected.test(actual));
    });
});
