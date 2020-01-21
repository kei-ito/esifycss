const dictionary: Array<string> = ['ESIFYCSS DICTIONARY'];
// const charToInteger = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('')
// .reduce<{[char: string]: number}>((map, char, index) => {
//     map[char] = index;
//     return map;
// }, {});
const charToInteger: {[key: string]: number} = JSON.parse('{"0":52,"1":53,"2":54,"3":55,"4":56,"5":57,"6":58,"7":59,"8":60,"9":61,"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,"J":9,"K":10,"L":11,"M":12,"N":13,"O":14,"P":15,"Q":16,"R":17,"S":18,"T":19,"U":20,"V":21,"W":22,"X":23,"Y":24,"Z":25,"a":26,"b":27,"c":28,"d":29,"e":30,"f":31,"g":32,"h":33,"i":34,"j":35,"k":36,"l":37,"m":38,"n":39,"o":40,"p":41,"q":42,"r":43,"s":44,"t":45,"u":46,"v":47,"w":48,"x":49,"y":50,"z":51,"+":62,"/":63,"=":64}');
const decode = (encoded: string | {$$esifycss: string}): string => {
    if (typeof encoded === 'object') {
        return encoded.$$esifycss;
    }
    const result: Array<string> = [];
    let value = 0;
    let shift = 0;
    const end = encoded.length;
    for (let index = 0; index < end; index++) {
        let integer = charToInteger[encoded[index]];
        if (0 <= integer) {
            const hasContinuationBit = integer & 32;
            integer &= 31;
            value += integer << shift;
            if (hasContinuationBit) {
                shift += 5;
            } else {
                // const shouldNegate = value & 1;
                value >>= 1;
                result.push(dictionary[value]);
                value = shift = 0;
            }
        } else {
            throw new Error(`EsifyCSS:UnexpectedToken:${encoded[index]}:'${encoded}'[${index}]`);
        }
    }
    return result.join('');
};

const style = document.createElement('style');

export const addStyle = (rules: Array<string | {$$esifycss: string}>): void => {
    if (!style.parentNode) {
        document.head.appendChild(style);
    }
    const cssStyleSheet = style.sheet as CSSStyleSheet;
    rules.forEach((words) => {
        const rule = decode(words);
        if (!(/^\s*@charset/i).test(rule)) {
            cssStyleSheet.insertRule(rule, cssStyleSheet.cssRules.length);
        }
    });
};
