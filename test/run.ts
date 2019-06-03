import anyTest, {TestInterface} from 'ava';
import {URL} from 'url';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as childProcess from 'child_process';
import * as selenium from 'selenium-webdriver';
import * as BrowserStack from 'browserstack-local';
import {createRequestHandler} from './util/createRequestHandler';
import {capabilities} from './util/capabilities';
import {browserStack} from './util/browserStack';
import {spawn} from './util/spawn';
import {createBrowserStackLocal} from './util/createBrowserStackLocal';
import {markResult} from './util/markResult';
const afs = fs.promises;

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

let port = 3000;
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
        t.context.baseURL = new URL(`http://127.0.0.1:${address.port}`);
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
    await new Promise((resolve, reject) => {
        t.context.server.close((error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
    if (t.context.bsLocal) {
        await new Promise((resolve) => {
            t.context.bsLocal.stop(resolve);
        });
    }
});

const testDirectories = fs.readdirSync(__dirname)
.map((name) => path.join(__dirname, name))
.filter((testDirectory) => {
    try {
        return fs.statSync(path.join(testDirectory, 'package.json')).isFile();
    } catch (error) {
        return false;
    }
});

for (const testDirectory of testDirectories) {
    const name = path.basename(testDirectory);
    for (const capability of capabilities) {
        test(name, async (t) => {
            const options: childProcess.SpawnOptionsWithoutStdio = {
                cwd: testDirectory,
                shell: true,
            };
            t.log('npm install');
            await spawn({command: 'npm install', options});
            t.log('npm run build');
            await spawn({command: 'npm run build', options});
            t.is(typeof options, 'object');
            const outputDirectory = path.join(testDirectory, 'output');
            t.true(fs.statSync(outputDirectory).isDirectory());
            t.log('start browser');
            t.context.server.on('request', createRequestHandler(outputDirectory, (message) => t.log(message)));

            const project = 'esifycss';
            const build = `${project}#${process.env.TRAVIS_BUILD_NUMBER}/${name}`;
            const localIdentifier = (`${build}${new Date().toISOString()}`).replace(/[^\w-]/g, '');
            if (browserStack) {
                Object.assign(capability, {
                    project,
                    build,
                    'browserstack.local': true,
                    'browserstack.localIdentifier': localIdentifier,
                    'browserstack.user': browserStack.user,
                    'browserstack.key': browserStack.key,
                });
            }
            const builder = t.context.builder = new selenium.Builder().withCapabilities(capability);
            if (browserStack) {
                builder.usingServer(browserStack.server);
                t.context.bsLocal = await createBrowserStackLocal({
                    accessKey: browserStack.key,
                    port: t.context.port,
                    localIdentifier,
                });
            }
            const driver = t.context.driver = builder.build();
            t.context.session = await driver.getSession();
            await driver.get(`${new URL('/index.html', t.context.baseURL)}`);
            await driver.wait(selenium.until.titleMatches(/(?:passed|failed)$/), 10000);
            const base64 = await driver.takeScreenshot();
            const screenShot = Buffer.from(base64, 'base64');
            await afs.writeFile(path.join(outputDirectory, `${Date.now()}.png`), screenShot);
            const output = await driver.findElement(selenium.By.css('#output'));
            t.log(`Text:\n${await output.getText()}`);
            const title = await driver.getTitle();
            const passed = title === `${path.basename(testDirectory)} → passed`;
            t.true(passed);
            t.context.passed = passed;
        });
    }
}
