import test from 'ava';
import {parseCSSModuleScript} from './parseCSSModuleScript';

interface Test {
    input: {
        title: string,
        code: string,
        cssKey: string,
    },
    expected: ReturnType<typeof parseCSSModuleScript> | null,
}

([
    {
        input: {
            title: 'simple',
            code: [
                ' import {addStyle} from \'esifycss\';',
                'addStyle([{esifycss:\'aaa\'}]);',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: {
            ranges: [
                {
                    css: 'aaa',
                    start: 46,
                    end: 62,
                },
            ],
            statements: [{start: 36, end: 65}],
        },
    },
    {
        input: {
            title: 'InvalidArrayExpression',
            code: [
                ' import {addStyle} from \'esifycss\';',
                'addStyle({esifycss:\'aaa\'});',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: {
            ranges: [],
            statements: [],
        },
    },
    {
        input: {
            title: 'NoAddStyle',
            code: 'addStyle([{esifycss:\'aaa\'}]);',
            cssKey: 'esifycss',
        },
        expected: {
            ranges: [
                {
                    css: 'aaa',
                    start: 10,
                    end: 26,
                },
            ],
            statements: [{start: 0, end: 29}],
        },
    },
    {
        input: {
            title: 'InvalidObjectExpression',
            code: [
                'import {addStyle} from \'esifycss\';',
                'addStyle([0]);',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: {
            ranges: [],
            statements: [],
        },
    },
    {
        input: {
            title: 'EmptyArray',
            code: [
                'import {addStyle} from \'esifycss\';',
                'addStyle([]);',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: {
            ranges: [],
            statements: [],
        },
    },
    {
        input: {
            title: 'Empty',
            code: [
                'import {addStyle} from \'esifycss\';',
                'addStyle();',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: {
            ranges: [],
            statements: [],
        },
    },
    {
        input: {
            title: 'InvalidKey',
            code: [
                'import {addStyle} from \'esifycss\';',
                'addStyle([{foo:\'aaa\'}]);',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: {
            ranges: [],
            statements: [],
        },
    },
    {
        input: {
            title: 'NonLiteral',
            code: [
                'import {addStyle} from \'esifycss\';',
                'addStyle([{esifycss:[]}]);',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: null,
    },
    {
        input: {
            title: 'InvalidCSSType',
            code: [
                'import {addStyle} from \'esifycss\';',
                'addStyle([{esifycss:1}]);',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: null,
    },
    {
        input: {
            title: 'Locally declared const addFoooo',
            code: [
                ' const addFoooo = () => null;',
                'addFoooo([{esifycss:\'aaa\'}]);',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: {
            ranges: [
                {
                    css: 'aaa',
                    start: 40,
                    end: 56,
                },
            ],
            statements: [{start: 30, end: 59}],
        },
    },
    {
        input: {
            title: 'Locally declared function addFoooo',
            code: [
                ' function addFoooo() {return null}',
                'addFoooo([{esifycss:\'aaa\'}]);',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: {
            ranges: [
                {
                    css: 'aaa',
                    start: 45,
                    end: 61,
                },
            ],
            statements: [{start: 35, end: 64}],
        },
    },
    {
        input: {
            title: 'Ignore AssignmentExpression',
            code: [
                ' function addFoooo() {return null}',
                'addFoooo([{esifycss:\'aaa\'}]);',
                'a += 1',
            ].join('\n'),
            cssKey: 'esifycss',
            localName: 'addFoooo',
        },
        expected: {
            ranges: [
                {
                    css: 'aaa',
                    start: 45,
                    end: 61,
                },
            ],
            statements: [{start: 35, end: 64}],
        },
    },
    {
        input: {
            title: 'dynamic import',
            code: [
                'import(\'./foo\').catch((err) => console.error(err));',
                'addStyle([{esifycss:\'aaa\'}]);',
            ].join('\n'),
            cssKey: 'esifycss',
        },
        expected: {
            ranges: [
                {
                    css: 'aaa',
                    start: 62,
                    end: 78,
                },
            ],
            statements: [
                {start: 52, end: 81},
            ],
        },
    },
] as Array<Test>).forEach(({input, expected}, index) => {
    test(`#${index} ${input.title}${expected ? '' : ' → Error'}`, (t) => {
        if (expected) {
            const actual = parseCSSModuleScript(input);
            t.deepEqual(actual, expected);
        } else {
            const error = t.throws(() => parseCSSModuleScript(input));
            t.is(error.message.slice(0, input.title.length), input.title);
        }
    });
});
