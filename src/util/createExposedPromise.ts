type Resolve = () => void;
type Reject = (error: Error) => void;

export interface ExposedPromise {
    readonly promise: Promise<void>,
    readonly resolve: Resolve,
    readonly reject: Reject,
}

export const createExposedPromise = (): ExposedPromise => {
    let resolve: Resolve | null = null;
    let reject: Reject | null = null;
    const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    if (resolve && reject) {
        return {promise, resolve, reject};
    }
    throw new Error('NoResolver');
};
