import test from 'ava';
import {getIncludePatterns} from './getIncludePatterns';

interface Test {
    input: Parameters<typeof getIncludePatterns>,
    expected: ReturnType<typeof getIncludePatterns>,
}

([
    {input: [{include: ['*'], extensions: ['.css']}], expected: ['**/*.css']},
    {input: [{include: ['aaa.css'], extensions: ['.css']}], expected: ['aaa.css']},
    {input: [{include: ['aaa.test'], extensions: ['.css']}], expected: ['aaa.test/**/*.css']},
    {
        input: [{include: ['aaa.test'], extensions: ['.css', '.scss']}],
        expected: ['aaa.test/**/*.css', 'aaa.test/**/*.scss'],
    },
] as Array<Test>).forEach(({input, expected}, index) => {
    test(`#${index} ${JSON.stringify(input)} → ${expected}`, (t) => {
        t.deepEqual(getIncludePatterns(...input), expected);
    });
});
