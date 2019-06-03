import * as css from './page.css.js';

const outputElement = document.body.appendChild(document.createElement('div'));
outputElement.id = 'output';
outputElement.style.fontFamily = 'Consolas, Courier, monospace';
outputElement.style.whiteSpace = 'pre-wrap';

const log = (message, color = null) => {
    const element = outputElement.appendChild(document.createElement('div'));
    element.appendChild(document.createTextNode(message));
    if (color) {
        element.style.color = color;
    }
};

const test = () => {
    log(JSON.stringify(css, null, 2));

    const fooElement = document.body.appendChild(document.createElement('div'));
    fooElement.id = css.id && css.id.foo;
    fooElement.classList.add(css.className && css.className.foo);
    fooElement.textContent = 'FOO';

    const computedStyle = getComputedStyle(fooElement);
    const result = [
        {name: 'text-align', expected: 'center'},
        {name: 'animation-duration', expected: '2s'},
        {name: 'animation-iteration-count', expected: 'infinite'},
        {name: 'animation-name', expected: css.keyframes.foo},
        {name: 'font-size', expected: '30px'},
    ]
    .reduce((result, {name, expected}) => {
        const actual = (computedStyle.getPropertyValue(name) || '').trim();
        log(JSON.stringify({name, actual, expected}));
        return result && actual === expected;
    }, true);
    const summary = result ? 'passed' : 'failed';
    document.title += ` → ${summary}`;
    log(summary);
};

try {
    test();
} catch (error) {
    log(`${error.stack || error}`);
}
