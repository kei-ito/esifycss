export interface IdGenerator {
    readonly idList: Array<string>,
    (key: string): number,
}

interface IdListener {
    (key: string, id: number): void,
}

export const createIdentifier = (
    listener: IdListener = () => {
        // noop
    },
): IdGenerator => {
    const knownIdList = new Map<string, number>();
    let count = 0;
    return Object.defineProperty(
        (key: string): number => {
            let id = knownIdList.get(key);
            if (typeof id === 'undefined') {
                id = count++;
                knownIdList.set(key, id);
                listener(key, id);
            }
            return id;
        },
        'idList',
        {
            get: () => {
                const result: Array<string> = [];
                for (const [id, index] of knownIdList) {
                    result[index] = id;
                }
                return result;
            },
        },
    ) as IdGenerator;
};
