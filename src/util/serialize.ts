import type {InspectOptions} from 'util';
import * as util from 'util';

export const serialize = (value: unknown, inspectOptions: InspectOptions = {}): string => {
    switch (typeof value) {
    case 'string':
        return value;
    default:
        return util.inspect(value, inspectOptions);
    }
};
