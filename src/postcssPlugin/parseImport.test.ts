import test from 'ava';
import {parseImport} from './parseImport';

interface Test {
    input: Parameters<typeof parseImport>,
    expected: ReturnType<typeof parseImport>,
}

([
    {
        input: ['"./foo.css" x', 'bar/input.css'],
        expected: {
            localName: 'x',
            from: 'bar/foo.css',
        },
    },
    {
        input: ['url("./foo.css") x', 'bar/input.css'],
        expected: {
            localName: 'x',
            from: 'bar/foo.css',
        },
    },
    {
        input: ['url( "./foo.css" ) x', 'bar/input.css'],
        expected: {
            localName: 'x',
            from: 'bar/foo.css',
        },
    },
    {
        input: ['"foo.css" x', 'bar/input.css'],
        expected: null,
    },
    {
        input: ['"./foo.css" x x', 'bar/input.css'],
        expected: null,
    },
    {
        input: ['"./foo.css" x!', 'bar/input.css'],
        expected: null,
    },
    {
        input: ['""./foo.css" x', 'bar/input.css'],
        expected: null,
    },
] as Array<Test>).forEach(({input, expected}, index) => {
    test(`#${index + 1} ${input[0]}`, (t) => {
        t.deepEqual(parseImport(...input), expected);
    });
});
