import ava from 'ava';
import {tokenizeString} from './tokenizeString';

interface Test {
    input: string,
    expected: Array<string>,
}

([
    {input: 'foo', expected: ['foo']},
    {input: 'width:100px', expected: ['width', ':', '100', 'px']},
] as Array<Test>).forEach(({input, expected}, index) => {
    ava(`#${index} ${JSON.stringify(input)} → ${expected.join('|')}`, (t) => {
        t.deepEqual(
            [...tokenizeString(input)],
            expected,
        );
    });
});
