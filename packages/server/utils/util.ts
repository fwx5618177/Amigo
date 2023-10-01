import fs from 'fs';
import path from 'path';

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description designed for checking empty of value
 */
export const isEmpty = (value: string | number | Object): boolean => {
    if (value === null) {
        return true;
    } else if (typeof value !== 'number' && value === '') {
        return true;
    } else if (typeof value === 'undefined' || value === undefined) {
        return true;
    } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
        return true;
    } else {
        return false;
    }
};

/**
 * @method loadGraphqlFileSync
 * @param pattern
 * @param options
 * @description load graphql from graphqls/* files
 */
export const loadGraphqlFileSync = (pattern: string): string => {
    const result = fs.readFileSync(path.join(__dirname, pattern as string), { encoding: 'utf8' });

    return result;
};

/**
 * 寻找数组中最后一个符合条件的元素下标
 * @param list 数组
 * @param predicate 条件
 * @returns {number} 元素下标，未找到返回-1
 */
export function findLastIndex<T>(list: T[], predicate: (item: T, index: number) => boolean) {
    for (let i = list.length - 1; i >= 0; i--) {
        if (predicate(list[i], i)) return i;
    }
    return -1;
}

/**
 * 从字符串中移除一层外层引号
 * @param str 字符串
 */
export function removeOuterQuoteOnce(str: string) {
    if (!str) return str;
    if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1); // 英文双引号
    if (str.startsWith("'") && str.endsWith("'")) return str.slice(1, -1); // 英文单引号
    if (str.startsWith('`') && str.endsWith('`')) return str.slice(1, -1); // 英文反引号
    if (str.startsWith('“') && str.endsWith('”')) return str.slice(1, -1); // 中文双引号
    if (str.startsWith('’') && str.endsWith('‘')) return str.slice(1, -1); // 中文单引号
    return str;
}
