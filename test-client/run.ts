import type {TestInterface} from 'ava';
import anyTest from 'ava';
import {URL} from 'url';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import type * as childProcess from 'child_process';
import * as selenium from 'selenium-webdriver';
import type * as BrowserStack from 'browserstack-local';
import {createRequestHandler} from './util/createRequestHandler';
import {browserStack} from './util/constants';
import {spawn} from './util/spawn';
import {createBrowserStackLocal} from './util/createBrowserStackLocal';
import {markResult} from './util/markResult';
import {capabilities} from './util/capabilities';
const {writeFile} = fs.promises;

const test = anyTest as TestInterface<{
    session?: selenium.Session,
    builder?: selenium.Builder,
    driver?: selenium.ThenableWebDriver,
    bsLocal: BrowserStack.Local,
    server: http.Server,
    port: number,
    baseURL: URL,
    passed: boolean,
}>;

/**
 * https://www.browserstack.com/question/664
 * Question: What ports can I use to test development environments or private
 * servers using BrowserStack?
 * → We support all ports for all browsers other than Safari.
 */
let port = 9200;
test.beforeEach(async (t) => {
    t.context.passed = false;
    t.context.server = await new Promise((resolve, reject) => {
        const server = http.createServer()
        .once('error', reject)
        .once('listening', () => {
            server.removeListener('error', reject);
            resolve(server);
        });
        server.listen(port++);
    });
    const address = t.context.server.address();
    if (address && typeof address === 'object') {
        t.context.port = address.port;
        t.context.baseURL = new URL(`http://localhost:${address.port}`);
    } else {
        throw new Error(`Invalid address: ${address}`);
    }
});

test.afterEach(async (t) => {
    if (t.context.session) {
        await markResult(t.context.session, t.context.passed);
    }
    if (t.context.driver) {
        await t.context.driver.quit();
    }
    await new Promise<void>((resolve, reject) => {
        t.context.server.close((error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
    if (t.context.bsLocal) {
        await new Promise<void>((resolve) => {
            t.context.bsLocal.stop(resolve);
        });
    }
});

const builtProjects = new Set<string>();
const build = async (
    testDirectory: string,
) => {
    if (!builtProjects.has(testDirectory)) {
        const spawnOptions: childProcess.SpawnOptionsWithoutStdio = {
            cwd: testDirectory,
            shell: true,
        };
        await spawn({command: 'npm install', options: spawnOptions});
        await spawn({command: 'npm run build', options: spawnOptions});
        builtProjects.add(testDirectory);
    }
};

const testNameList = fs.readdirSync(__dirname).filter((name) => {
    try {
        return fs.statSync(path.join(__dirname, name, 'package.json')).isFile();
    } catch {
        return false;
    }
});

for (const testName of testNameList) {
    for (const $capability of capabilities) {
        const {'bstack:options': options} = $capability;
        const capability = {
            ...$capability,
            'bstack:options': {
                ...options,
                sessionName: testName,
            },
        };
        const testDirectory = path.join(__dirname, testName);
        const outputDirectory = path.join(testDirectory, 'output');
        test.serial(`${testName} ${options.os || options.deviceName || '-'} ${capability.browserName}`, async (t) => {
            t.timeout(120000);
            await build(testDirectory);
            t.context.server.on('request', createRequestHandler(
                outputDirectory,
                (message) => t.log(message),
            ));
            const builder = new selenium.Builder().withCapabilities(capability);
            t.context.builder = builder;
            if (browserStack) {
                builder.usingServer(browserStack.server);
                t.context.bsLocal = await createBrowserStackLocal({
                    accessKey: browserStack.accessKey,
                    port: t.context.port,
                    localIdentifier: capability['bstack:options'].localIdentifier,
                });
            }
            const driver = t.context.driver = builder.build();
            const baseURL = (/safari/i).test(capability.browserName) ? new URL(`http://bs-local.com:${t.context.port}`) : t.context.baseURL;
            t.context.session = await driver.getSession();
            await driver.get(`${new URL('/index.html', baseURL)}`);
            await driver.wait(selenium.until.titleMatches(/(?:passed|failed)$/), 10000);
            const base64 = await driver.takeScreenshot();
            const screenShot = Buffer.from(base64, 'base64');
            await writeFile(path.join(outputDirectory, `${Date.now()}.png`), screenShot);
            const title = await driver.getTitle();
            const passed = title === `${path.basename(testDirectory)} → passed`;
            t.true(passed);
            t.context.passed = passed;
        });
    }
}
