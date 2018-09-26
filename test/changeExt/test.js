const path = require('path');
const os = require('os');
const t = require('tap');
const afs = require('@nlib/afs');
const postcss = require('postcss');
const esifycss = require('../../lib');
const {getExports} = require('../util');

t.test('changeExt', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'es'));
    await afs.deploy(directory, {
        'foo.css': [
            '.foo {--color: red}',
            '@media print {}',
        ].join('\n'),
        'bar': {
            'bar.css': '.bar {--color: blue}',
        },
    });
    const dest = path.join(directory, 'output.css');
    await esifycss.start({
        patterns: path.join(directory, '*.css'),
        base: directory,
        dest,
        changeExt: true,
    });
    await t.rejects(afs.readFile(path.join(directory, 'bar/bar.js')));
    const outputJS = await afs.readFile(path.join(directory, 'foo.js'), 'utf8');
    const exported = getExports(outputJS);
    t.match(exported, {
        classes: {foo: '_foo_css_foo'},
        properties: {color: 'red'},
        default: {
            classes: {name: 'classes'},
            properties: {name: 'properties'},
        },
    });
    const outputCSS = await afs.readFile(dest, 'utf8');
    const cssAST = postcss.parse(outputCSS);
    t.equal(cssAST.nodes[0].selector, `.${exported.classes.foo}`);
    t.match(cssAST.nodes[0].nodes[0], {
        prop: '--color',
        value: exported.properties.color,
    });
});