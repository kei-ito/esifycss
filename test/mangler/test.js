const path = require('path');
const os = require('os');
const t = require('tap');
const afs = require('@nlib/afs');
const postcss = require('postcss');
const esifycss = require('../../lib');
const {getExports} = require('../util');

t.test('mangler', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'es'));
    await afs.deploy(directory, {
        'foo.css': '.foo {--color: red}',
        'bar': {
            'bar.css': '.bar {--color: blue}',
        },
    });
    const dest = path.join(directory, 'output.css');
    let counter = 0;
    const cache = new Map();
    await esifycss.start({
        patterns: path.join(directory, '*.css'),
        base: directory,
        dest,
        mangler: (file, name) => {
            const id = `${file}$${name}`;
            if (!cache.has(id)) {
                cache.set(id, `_${counter++}`);
            }
            return cache.get(id);
        },
    });
    await t.rejects(afs.readFile(path.join(directory, 'bar/bar.css.js')));
    const outputJS = await afs.readFile(path.join(directory, 'foo.css.js'), 'utf8');
    const exported = getExports(outputJS);
    t.match(exported, {
        classes: {foo: '_0'},
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