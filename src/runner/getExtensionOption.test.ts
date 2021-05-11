import test from 'ava';
import {getExtensionOption} from './getExtensionOption';

interface Test {
    input: Parameters<typeof getExtensionOption>,
    expected: ReturnType<typeof getExtensionOption>,
}

([
    {input: [{ext: undefined}, {type: 'script', path: 'test.js'}], expected: '.js'},
    {input: [{ext: undefined}, {type: 'script', path: 'test.ts'}], expected: '.ts'},
    {input: [{ext: '.js'}, {type: 'script', path: 'test.ts'}], expected: '.js'},
    {input: [{ext: undefined}, {type: 'css', path: 'test.css'}], expected: '.js'},
    {input: [{ext: '.ts'}, {type: 'css', path: 'test.css'}], expected: '.ts'},
] as Array<Test>).forEach(({input, expected}, index) => {
    test(`#${index} ${JSON.stringify(input)} → ${expected}`, (t) => {
        t.is(getExtensionOption(...input), expected);
    });

});
