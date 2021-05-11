import test from 'ava';
import {encodeString, decodeString} from './encodeString';
import {createIdentifier} from './createIdGenerator';

interface Test {
    input: string,
    preset?: Array<string>,
    expected: string,
    expectedWords: Array<string>,
}

([
    {
        input: 'foo',
        expected: 'A',
        expectedWords: ['foo'],
    },
    {
        input: 'bar foo foo foo foo',
        expected: 'ACECECECE',
        expectedWords: ['bar', ' ', 'foo'],
    },
    {
        input: 'bar foo foo foo foo',
        preset: ['foo', ' '],
        expected: 'ECACACACA',
        expectedWords: ['foo', ' ', 'bar'],
    },
] as Array<Test>).forEach(({input, preset, expected, expectedWords}, index) => {
    test(`#${index} ${JSON.stringify(input)} ${JSON.stringify(preset || [])} → ${expected}`, (t) => {
        const identifier = createIdentifier();
        if (preset) {
            for (const token of preset) {
                identifier(token);
            }
        }
        const actual = encodeString(input, identifier);
        t.is(actual, expected);
        t.deepEqual(
            identifier.idList,
            expectedWords,
        );
        t.is(decodeString(actual, identifier.idList), input);
    });
});
