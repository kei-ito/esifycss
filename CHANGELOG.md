# Changelog

## v1.4.27 (2021-03-14)

### Dependency Upgrades

- upgrade dependencies (#235) (8074d39)


## v1.4.26 (2020-12-20)

### Dependency Upgrades

- upgrade dependencies (#165) (2c1b842)


## v1.4.25 (2020-10-30)

### Continuous Integration

- update TestClient condition (78feb22)
- update TestClient condition (af18829)
- update TestClient condition (25cabb6)

### Dependency Upgrades

- upgrade dependencies (#107) (d5bc422)


## v1.4.24 (2020-10-04)

### Continuous Integration

- fix scripts before publish (bbadd29)
- remove the prepack scripts (c1ad02c)

### Dependency Upgrades

- @nlib/changelog@0.1.9 (b33409d)
- setup nlib-lint-commit (6e240fa)


## v1.4.23 (2020-10-01)

### Code Refactoring

- use require.main === module (66d47d0)
- fit to postcss 8 (92bd7c8)

### Styles

- fix eslint errors (c873264)

### Dependency Upgrades

- upgrade dependencies (863dce4)


## v1.4.22 (2020-07-12)

### Bug Fixes

- support <url> (af229eb)

### Tests

- parse multiple animations (cafbd8b)

### Code Refactoring

- remove comments in walker (d6573ab)
- use type (6390995)


## v1.4.21 (2020-07-11)

### Code Refactoring

- use parse-animation-shorthand instead of nbnf (a984029)

### Build System

- setup github actions (#83) (f9a1892)


## v1.4.20 (2020-06-25)

### Bug Fixes

- copy .d.ts (4142305)


## v1.4.19 (2020-06-24)

### Bug Fixes

- set ecmaVersion (#79) (37cfcb7)

### Tests

- dynamic import (#79) (0dfe44a)


## v1.4.18 (2020-06-24)

### Bug Fixes

- remove acorn-dynamic-import (#79) (ee1c7f3)


## v1.4.17 (2020-06-19)

### Bug Fixes

- ignore invalid arguments (495f034)


## v1.4.16 (2020-06-17)

### Bug Fixes

- leave import statements (c1b6610)


## v1.4.15 (2020-06-17)

### Bug Fixes

- ignore AssignmentExpression (b991b2c)


## v1.4.14 (2020-06-15)

### Bug Fixes

- support locally declared addStyle functions (d59b3a9)


## v1.4.13 (2020-06-02)

### Bug Fixes

- remove the uninstalled package (99548ce)

### Tests

- set timeout in ava configuration (2f7ae5e)
- set timeout (ba255ea)
- set timeout (a36b976)
- set timeout (cd6da04)
- set timeout (324680f)

### Code Refactoring

- split tests (2e61cac)
- fix eslint errors (33a011c)


## v1.4.12 (2020-01-23)


## v1.4.11 (2020-01-22)

### Bug Fixes

- include types (de03027)


## v1.4.10 (2020-01-21)

### Bug Fixes

- add some utilities (62b50a7)


## v1.4.9 (2020-01-21)

### Bug Fixes

- index.ts (449608b)


## v1.4.8 (2020-01-21)

### Bug Fixes

- remove helper (0919f38)


## v1.4.7 (2020-01-21)

### Bug Fixes

- remove .ts extension (9e169f2)
- build script (69cd62c)
- determine helper import from source string (8ea1e48)

### Code Refactoring

- add StringLiteral (c9d2752)


## v1.4.6 (2020-01-21)

### Tests

- fix tests (c17f983)


## v1.4.5 (2020-01-21)

### Bug Fixes

- update minifier not to use RegExp (6702084)
- addStyle accepts an array of css objects (38faafc)

### Tests

- parseCSSModuleScript (5c05722)

### Code Refactoring

- update types (bf194bb)
- add cssKey (7d89478)
- minifyScripts (da12e6d)


## v1.4.4 (2020-01-20)

### Bug Fixes

- use acorn to remove import declarations (#59) (279ccc2)


## v1.4.3 (2020-01-19)

### Bug Fixes

- keep addStyle (#58) (3fb510e)


## v1.4.2 (2020-01-18)

### Bug Fixes

- generatescript (#57) (cf1855b)


## v1.4.1 (2020-01-18)

### Features

- expose helperPath (0bc6fca)


## v1.4.0 (2020-01-18)

### Features

- output css (#55) (701b733)

### Tests

- fix css test (393c134)

### Documentation

- update README (a021455)


## v1.3.14 (2020-01-06)


## v1.3.13 (2019-12-09)


## v1.3.12 (2019-12-09)

### Documentation

- postcssOptions (594f90e)


## v1.3.11 (2019-12-07)

### Bug Fixes

- ignore charset rules (572d552)


## v1.3.9 (2019-12-06)

### Features

- support postcss.ProcessOptions (026c237)

### Tests

- scss (c00d7d6)


## v1.3.8 (2019-11-14)

### Code Refactoring

- fix an eslint error (0136a32)


## v1.3.7 (2019-10-30)

### Bug Fixes

- remove spaces (dbb3cbb)

### Tests

- wait messages (e5303c1)

### Code Refactoring

- update setDictionary (b4ccde1)

### Documentation

- update README (d4c5d76)


## v1.3.6 (2019-09-20)

### Code Refactoring

- fix type errors (#41) (9d62f7e)


## v1.3.5 (2019-09-04)

### Bug Fixes

- minifyCSSInScript is not asnyc (240f045)


## v1.3.4 (2019-09-04)

### Bug Fixes

- allow dynamic import (1e3561b)


## v1.3.3 (2019-07-15)


## v1.3.2 (2019-07-08)

### Features

- add css.d.ts for typeRoots (81bcdde)


## v1.3.1 (2019-07-05)

### Features

- use acorn to extract CSS in script (7585e32)


## v1.3.0 (2019-07-05)

### Features

- add getHelperScript and update processCSS (696045a)

### Tests

- fix the message to be wait (db75c1e)

### Code Refactoring

- change the encoding format (4d310ce)


## v1.2.11 (2019-07-05)

### Tests

- add tests for serializeCSSAnimationShorthand (5f9eff2)

### Code Refactoring

- split serializeTimingFunction (21fdf2c)

### Documentation

- update CLI help (dcdd80d)


## v1.2.10 (2019-07-03)

### Bug Fixes

- normalize path for Windows (c5d013f)
- allow raw css to work in watch-mode (c6e9fb3)

### Tests

- test the generated code (b9d65d9)

### Code Refactoring

- fill the listener (9cd3fdd)


## v1.2.9 (2019-07-02)

### Features

- update mangler function (de49888)
- add the extensions option (7c81df8)

### Code Refactoring

- fix codeclimate issues (d5bb626)
- fix an eslint error (6db7da6)

### Styles

- change the log format (724fa7f)

### Documentation

- update example (a021bbf)
- add images (9038721)


## v1.2.8 (2019-06-22)

### Bug Fixes

- class → className (9d3b3c1)


## v1.2.7 (2019-06-21)

### Features

- export tokenizeString and delete countTokens (2883942)


## v1.2.6 (2019-06-21)

### Features

- export createOptimizedIdentifier (64d3ed8)


## v1.2.5 (2019-06-21)

### Bug Fixes

- rename (9bbdcfc)


## v1.2.4 (2019-06-21)

### Features

- export some modules for minification (372197d)


## v1.2.3 (2019-06-21)

### Bug Fixes

- add safe-base64 encoding and make it default (37fde07)


## v1.2.2 (2019-06-21)

### Bug Fixes

- include declarations (cc2b48c)


## v1.2.1 (2019-06-21)

### Features

- delete the minifyScript option (b0b1a24)

### Documentation

- rename IXXXParameters and update README (30a29fa)
- add some comments (6893026)


## v1.2.0 (2019-06-20)

### Features

- add rawPrefix option (86783ad)

### Bug Fixes

- add normalizePath (38fd430)

### Code Refactoring

- remove a debug code (0f0e885)
- merge wordToString to decode (e871d54)

### Documentation

- update README (fcc3480)
- update README (7a10f8d)
- update README (161c8b6)


## v1.1.2 (2019-06-19)

### Features

- add processCSS and hide the public handlers (8425ef2)


## v1.1.1 (2019-06-19)

### Features

- expose the event handlers (2a51bef)


## v1.1.0 (2019-06-19)

### Features

- the 1st arg of the constructor is optional (b3bbb86)
- rename output to helper (b26dce5)
- all options are optional (4375f02)

### Tests

- fix the command (9dde927)

### Documentation

- fix the appveyor badge (67cf241)


## v1.0.1 (2019-06-18)

### Features

- parse @import and transform identifiers (71805e8)
- add noMangle option (c5377fa)
- rewrite and reconfigure Renovate (#19) (914f7ff)

### Code Refactoring

- move interfaces (af374cb)

### Documentation

- update README (64b93cf)
- include sample outputs (4dff76a)
- add sample (2906d01)
- update README (6e02055)


## v0.1.16 (2019-01-24)

### Code Refactoring

- fix eslint errors (8f51d72)


## v0.1.15 (2018-10-15)


## v0.1.14 (2018-10-15)


## v0.1.13 (2018-10-12)


## v0.1.12 (2018-10-11)


## v0.1.11 (2018-10-11)


## v0.1.10 (2018-10-05)


## v0.1.9 (2018-10-05)


## v0.1.8 (2018-09-28)


## v0.1.7 (2018-09-27)


## v0.1.6 (2018-09-27)


## v0.1.5 (2018-09-26)


## v0.1.4 (2018-09-26)


## v0.1.3 (2018-09-21)


## v0.1.1 (2018-09-21)


## v0.1.0 (2018-09-21)


