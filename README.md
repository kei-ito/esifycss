# EsifyCSS

![Test](https://github.com/kei-ito/esifycss/workflows/Test/badge.svg)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=WDQvOHgwbkRNTUFyUVkrc0RmdGgva0diVk01Tm9LWU95ZFNGVTByeHhpVT0tLUc2RW9lNnNaY2k4QkVCSjMyalRGTVE9PQ==--007efb48774305e72904bb3a15d3b0d048dbfb91)](https://www.browserstack.com/automate/public-build/WDQvOHgwbkRNTUFyUVkrc0RmdGgva0diVk01Tm9LWU95ZFNGVTByeHhpVT0tLUc2RW9lNnNaY2k4QkVCSjMyalRGTVE9PQ==--007efb48774305e72904bb3a15d3b0d048dbfb91)
[![codecov](https://codecov.io/gh/kei-ito/esifycss/branch/master/graph/badge.svg)](https://codecov.io/gh/kei-ito/esifycss)

## Introduction

EsifyCSS finds CSS files in your project and generates ES modules for each of
them.

Assume that you have `src/style1.css` and `src/style2.css`. They have the same
contents:

```css
/* src/style1.css, src/style2.css */
@keyframes FadeIn {
    0%: {opacity: 0}
  100%: {opacity: 0}
}
@keyframes Rotate {
    0%: {transform: rotate(  0deg)}
  100%: {transform: rotate(360deg)}
}
#container {
  animation: 0.2s linear FadeIn;
}
.icon {
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
.icon.rotate {
  animation-name: Rotate;
}
```

Then, run `esifycss --helper src/helper.js src`. `--helper src/helper.js` is
where the helper script is written. The last `src` specifies the directory that
contains the file to be processed by EsifyCSS.

The process finds CSS files, parses them, extracts identifiers, replaces them with
 values.

After the process, you'll get `src/style1.css.js` and `src/style2.css.js`:

```javascript
// src/style1.css.js
import {addStyle} from './helper.js';
addStyle(["WYIGqCCQSCaAQEcSCaAUEE","WYIGsCCQSCeAgBiBIIQkBmBEcSCeAgBiByBkBmBEE","0BGQC2BA4BKOA6BoBIqBIGqCKE","sBGUCOM8BAUoBKOM+BMgCAiCKOMkCMmCAqBKE","sBG2CG4CCOMoCAGsCKE"]);
export const className = {
    "icon": "_1",
    "rotate": "_2"
};
export const id = {
    "container": "_0"
};
export const keyframes = {
    "FadeIn": "_3",
    "Rotate": "_4"
};
```

```javascript
// src/style2.css.js
import {addStyle} from './helper.js';
addStyle(["WYIGuBCQSCaAQEcSCaAUEE","WYIGwBCQSCeAgBiBIIQkBmBEcSCeAgBiByBkBmBEE","0BGuCC2BA4BKOA6BoBIqBIGuBKE","sBGwCCOM8BAUoBKOM+BMgCAiCKOMkCMmCAqBKE","sBGyCG0CCOMoCAGwBKE"]);
export const className = {
    "icon": "_6",
    "rotate": "_7"
};
export const id = {
    "container": "_5"
};
export const keyframes = {
    "FadeIn": "_8",
    "Rotate": "_9"
};
```

The two modules are almost the same, but the exported objects are different. And
there will be `src/helper.js` which exports the `addStyle` function which
applies the style to documents. You can see the code at
[sample/01-mangle/helper.js](sample/01-mangle/helper.js).

The exported objects are mappings of identifiers of `className`, `id`, and
`keyframes` that were replaced in the process. You should import them and use
the replaced identifiers instead of original in the code:

```javascript
import style from './style1.css.js';
const element = document.createElement('div');
element.classList.add(style.className.icon);
```

## Tools

EsifyCSS consists of **PostCSS plugin**, **Runner** and **CLI**.

### PostCSS plugin

The plugin converts the identifiers in CSS and minifies them. It outputs the
result of minifications using [Root.warn()].

[Root.warn()]: http://api.postcss.org/Root.html#warn

### Runner

A runner process `.css` files in your project with PostCSS and output the
results to `.css.js` or `.css.ts`.

### CLI

```
Usage: esifycss [options] <include ...>

Options:
  -V, --version         output the version number
  --helper <path>       A path where the helper script will be output. You can't use --helper with --css.
  --css <path>          A path where the css will be output. You can't use --css with --helper.
  --ext <ext>           An extension of scripts generated from css.
  --config <path>       A path to configuration files.
  --exclude <path ...>  Paths or patterns to be excluded.
  --noMangle            Keep the original name for debugging.
  --watch               Watch files and update the modules automatically.
  -h, --help            output usage information
```

## Installation

```bash
npm install --save-dev esifycss
```

## `@import` Syntax

You can use `@import` syntax if the style declarations requires identifiers
declared in other files.

For example, Assume you have the following `a.css` and `b.css`.

```css
/* a.css */
.container {...} /* → ._0 */
```

```css
/* b.css */
.container {...} /* → ._1 */
```

The `container` class names will be shortened to unique names like `_0` and
`_1`. You can import the shortened names with the `@import` syntax.

```css
/* "modA-" is prefix for a.css */
@import './a.css' modA-;
/* "bbbb" is prefix for b.css */
@import './b.css' BBB;
.wrapper>.modA-container {...} /* → ._2>._0 */
.wrapper>.BBBcontainer {...}   /* → ._2>._1 */
```

## JavaScript API for Runner

```javascript
import {Session} from 'esifycss';
new Session(options).start()
.then(() => console.log('Done'))
.catch((error) => console.error(error));
```

### Options

```typescript
export interface SessionOptions {
  /**
   * Pattern(s) to be included
   * @default "*"
   */
  include?: string | Array<string>,
  /**
   * Pattern(s) to be excluded.
   * @default ['node_modules']
   */
  exclude?: anymatch.Matcher,
  /**
   * File extension(s) to be included.
   * @default ['.css']
   */
  extensions?: Array<string>,
  /**
   * Where this plugin outputs the helper script.
   * If you use TypeScript, set a  value like '*.ts'.
   * You can't use this option with the css option.
   * The {hash} in the default value is calculated from the include option.
   * @default "helper.{hash}.css.js"
   */
  helper?: string,
  /**
   * File extension of generated script.
   * @default options.helper ? path.extname(options.helper) : '.js'
   */
  ext?: string,
  /**
   * Where this plugin outputs the css.
   * You can't use this option with the helper option.
   * @default undefined
   */
  css?: string,
  /**
   * It it is true, a watcher is enabled.
   * @default false
   */
  watch?: boolean,
  /**
   * Options passed to chokidar.
   * You can't set ignoreInitial to true.
   * @default {
   *   ignore: exclude,
   *   ignoreInitial: false,
   *   useFsEvents: false,
   * }
   */
  chokidar?: chokidar.WatchOptions,
  /**
   * An array of postcss plugins.
   * esifycss.plugin is appended to this array.
   * @default []
   */
  postcssPlugins?: Array<postcss.AcceptedPlugin>,
  /**
   * https://github.com/postcss/postcss#options
   * @default undefined
   */
  postcssOptions?: postcss.ProcessOptions,
  /**
   * Parameters for esifycss.plugin.
   */
  esifycssPluginParameter?: PluginOptions,
  /**
   * A stream where the runner outputs logs.
   * @default process.stdout
   */
  stdout?: stream.Writable,
  /**
   * A stream where the runner outputs errorlogs.
   * @default process.stderr
   */
  stderr?: stream.Writable,
}
```

Source: [src/runner/types.ts](src/runner/types.ts)

## JavaScript API for Plugin

```javascript
const postcss = require('postcss');
const esifycss = require('esifycss');
postcss([
  esifycss.plugin({/* Plugin Options */}),
])
.process(css, {from: '/foo/bar.css'})
.then((result) => {
  const pluginResult = esifycss.extractPluginResult(result);
  console.log(pluginResult);
  // → {
  //   className: {bar: '_1'},
  //   id: {foo: '_0'},
  //   keyframes: {aaa: '_2'},
  // }
});
```

The code is at [sample/plugin.js](sample/plugin.js).
You can run it by `node sample/plugin.js` after cloning this repository and
running `npm run build`.

### Options

```typescript
export interface PluginOptions {
  /**
   * When it is true, this plugin minifies classnames.
   * @default true
   */
  mangle?: boolean,
  /**
   * A function returns an unique number from a given file id. If you process
   * CSS files in multiple postcss processes, you should create an identifier
   * outside the processes and pass it as this value to keep the uniqueness
   * of mangled outputs.
   * @default esifycss.createIdGenerator()
   */
  identifier?: IdGenerator,
  /**
   * Names starts with this value are not passed to mangler but replaced with
   * unprefixed names.
   * @default "raw-"
   */
  rawPrefix?: string,
  /**
   * A custom mangler: (*id*, *type*, *name*) => string.
   * - *id*: string. A filepath to the CSS.
   * - *type*: 'id' | 'class' | 'keyframes'. The type of *name*
   * - *name*: string. An identifier in the style.
   *
   * If mangler is set, `mangle` and `identifier` options are ignored.
   *
   * For example, If the plugin processes `.foo{color:green}` in `/a.css`,
   * The mangler is called with `("/a.css", "class", "foo")`. A mangler should
   * return an unique string for each input pattern or the styles will be
   * overwritten unexpectedly.
   * @default undefined
   */
  mangler?: PluginMangler,
}
```

Source: [src/postcssPlugin/types.ts](src/postcssPlugin/types.ts)

## LICENSE

The esifycss project is licensed under the terms of the Apache 2.0 License.
