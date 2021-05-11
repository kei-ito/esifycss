import * as BrowserStack from 'browserstack-local';

export const createBrowserStackLocal = async (
    parameters: {
        accessKey: string,
        port: number,
        localIdentifier: string,
    },
): Promise<BrowserStack.Local> => {
    const bsLocal = new BrowserStack.Local();
    await new Promise((resolve, reject) => {
        bsLocal.start({
            key: parameters.accessKey,
            verbose: true,
            forceLocal: true,
            onlyAutomate: true,
            only: `localhost,${parameters.port},0`,
            localIdentifier: parameters.localIdentifier,
        }, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve(bsLocal);
            }
        });
    });
    await new Promise<void>((resolve, reject) => {
        let count = 0;
        const check = function () {
            if (bsLocal.isRunning()) {
                resolve();
            } else if (count++ < 30) {
                setTimeout(check, 1000);
            } else {
                reject(new Error('Failed to start browserstack-local'));
            }
        };
        check();
    });
    return bsLocal;
};
