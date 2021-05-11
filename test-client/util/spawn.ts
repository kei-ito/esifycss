import * as childProcess from 'child_process';
import type * as stream from 'stream';

interface SpawnParameters {
    command: string,
    args?: Array<string>,
    options?: childProcess.SpawnOptionsWithoutStdio,
    stdout?: stream.Writable,
    stderr?: stream.Writable,
}

export const spawn = async (parameters: SpawnParameters): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
        const subProcess = childProcess.spawn(
            parameters.command,
            parameters.args || [],
            parameters.options || {},
        )
        .once('error', reject)
        .once('exit', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`The command "${parameters.command}" exited with code ${code}.`));
            }
        });
        if (subProcess.stdout) {
            subProcess.stdout.pipe(parameters.stdout || process.stdout);
        }
        if (subProcess.stderr) {
            subProcess.stderr.pipe(parameters.stderr || process.stderr);
        }
    });
};
