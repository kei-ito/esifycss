import test from 'ava';
import * as postcss from 'postcss';
import {minify} from './minify';

interface Test {
    css: string,
    expected: string,
}

([
    {
        css: '\n\n\n',
        expected: '',
    },
    {
        css: [
            '  /* comment */',
            ' @import url("foo.css") print  ; ;',
            '  /* comment */',
            '\n.foo  #bar >  div { ; ; foo : bar ; ; bar : "foo" ; ;; } ;\n\n',
            '  /* comment */',
        ].join('\n;;\n'),
        expected: [
            '@import url("foo.css") print;',
            '.foo #bar>div{foo:bar;bar:"foo"}',
        ].join(''),
    },
] as Array<Test>).forEach(({css, expected}, index) => {
    test(`#${index + 1} ${expected}`, (t) => {
        const root = minify(postcss.parse(css));
        t.is(root.toString(), expected);
    });
});
