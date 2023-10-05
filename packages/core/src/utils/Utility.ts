import { BinaryLike, createHash } from 'crypto';
import { promisify } from 'util';
import zlib from 'zlib';
import stream from 'stream';

/**
 * Utility 类提供了一系列实用方法。
 */
class Utility {
    /** 一个长度为0的缓冲区 */
    public static BUF0 = Buffer.alloc(0);

    /** 一个长度为4，内容全为0的缓冲区 */
    public static BUF4 = Buffer.alloc(4);

    /** 一个长度为16，内容全为0的缓冲区 */
    public static BUF16 = Buffer.alloc(16);

    /** 一个不执行任何操作的函数，常用于初始化或作为默认的回调函数 */
    public static NOOP = () => {};

    /**
     * 异步解压缓冲区的方法
     * @param buffer - 需要被解压的缓冲区
     * @returns 返回一个解压后的缓冲区
     */
    public static unzip = promisify(zlib.unzip);

    /**
     * 异步压缩缓冲区的方法
     * @param buffer - 需要被压缩的缓冲区
     * @returns 返回一个压缩后的缓冲区
     */
    public static gzip = promisify(zlib.gzip);

    /**
     * 异步流管道
     * 用于将可读流的数据传输到可写流
     */
    public static pipeline = promisify(stream.pipeline);

    /**
     * 生成md5哈希
     * @param data - 需要生成哈希的数据
     * @returns 返回数据的md5哈希值
     */
    public static md5(data: BinaryLike): Buffer {
        return createHash('md5').update(data).digest();
    }

    /**
     * 生成sha1哈希
     * @param data - 需要生成哈希的数据
     * @returns 返回数据的sha1哈希值
     */
    public static sha(data: BinaryLike): Buffer {
        return createHash('sha1').update(data).digest();
    }

    /**
     * 生成一个随机字符串
     * @param n - 生成的随机字符串的长度
     * @param template - 用于生成随机字符串的字符模板
     * @returns 返回一个随机字符串
     */
    public static randomString(n: number, template = 'abcdef1234567890') {
        const len = template.length;
        return new Array(n)
            .fill(false)
            .map(() => template.charAt(Math.floor(Math.random() * len)))
            .join('');
    }

    /**
     * 格式化时间
     *
     * @description
     * 这个函数允许用户以指定的格式模板展示时间。支持的输入类型包括 Date 对象、数字类型的时间戳和能被
     * 转换为 Date 对象的字符串。用户可以自定义时间的格式模板，利用占位符来表示年、月、日、小时、
     * 分钟和秒等不同的时间单位。
     *
     * @param value - 输入的时间值。它可以是一个 Date 对象，表示具体的日期和时间；也可以是一个数字类型
     * 的时间戳，表示从 1970 年 1 月 1 日 00:00:00 UTC 到指定日期和时间的毫秒数；还可以是一个能被
     * 转换为 Date 对象的字符串。
     *
     * @param template - 时间的格式模板。这是一个字符串，其中包含表示不同时间单位的占位符。例如：
     * "yyyy-MM-dd HH:mm:ss" 会被格式化为 "2023-10-07 15:30:45" 这样的字符串。模板中的占位符
     * 和它们表示的时间单位有：
     *   - "yyyy": 年份，四位数字
     *   - "MM": 月份，两位数字
     *   - "dd": 日期，两位数字
     *   - "HH": 小时，24小时制，两位数字
     *   - "mm": 分钟，两位数字
     *   - "ss": 秒，两位数字
     *   - "S": 毫秒，一到三位数字
     * 函数会根据这些占位符和输入的时间值，生成一个格式化后的时间字符串。
     *
     * @returns 返回一个格式化后的时间字符串。这个字符串是根据输入的时间值和格式模板生成的，它以一种
     * 更易读的方式展示时间，方便用户查看和理解。
     *
     * @example
     * // 返回 "2023-10-07 15:30:45"
     * formatTime(new Date('2023-10-07T15:30:45'), 'yyyy-MM-dd HH:mm:ss');
     */
    public static formatDateTime(
        input: Date | number | string,
        formatPattern: string = 'yyyy-MM-dd HH:mm:ss',
    ): string {
        // 将输入值转换为 Date 对象，确保能够获取到日期和时间的信息
        const targetDate = new Date(input);

        // 定义一个映射对象，存储日期的各个部分，如月份、日、小时等，并为它们分配相应的值
        const datePartsMapping: Record<string, number> = {
            'M+': targetDate.getMonth() + 1, // 月份，+1 是因为月份的索引从0开始
            'd+': targetDate.getDate(), // 日期
            'H+': targetDate.getHours(), // 小时
            'm+': targetDate.getMinutes(), // 分钟
            's+': targetDate.getSeconds(), // 秒
            'q+': Math.floor((targetDate.getMonth() + 3) / 3), // 季度
            'S': targetDate.getMilliseconds(), // 毫秒
        };

        // 检查格式字符串中是否有年份的表示，如果有，则替换为实际的年份
        if (/(y+)/.test(formatPattern)) {
            // 使用正则表达式获取年份的格式，根据格式的长度来获取相应位数的年份
            formatPattern = formatPattern.replace(/(y+)/, matchedPattern =>
                (targetDate.getFullYear() + '').slice(0, matchedPattern.length),
            );
        }

        // 遍历日期的各个部分的映射对象，将格式字符串中的占位符替换为实际的值
        for (const key in datePartsMapping) {
            const pattern = new RegExp(`(${key})`);
            if (pattern.test(formatPattern)) {
                // 根据占位符的长度来格式化日期的各个部分的值，保证其字符串形式的长度与占位符的长度一致
                formatPattern = formatPattern.replace(pattern, matchedPattern =>
                    `${datePartsMapping[key]}`.padStart(matchedPattern.length, '0'),
                );
            }
        }

        // 返回格式化后的日期时间字符串
        return formatPattern;
    }

    /**
     * 获取当前的UNIX时间戳（秒为单位）
     * @returns 返回当前的UNIX时间戳
     */
    public static timestamp() {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * 将整数形式的IP地址转换为字符串形式
     * @param ip - 整数形式的IP地址
     * @returns 返回字符串形式的IP地址
     */
    public static int32ip2str(ip: number | string) {
        if (typeof ip === 'string') return ip;
        ip = ip & 0xffffffff;
        return [
            ip & 0xff,
            (ip & 0xff00) >> 8,
            (ip & 0xff0000) >> 16,
            ((ip & 0xff000000) >> 24) & 0xff,
        ].join('.');
    }

    /**
     * 隐藏并锁定对象的一个属性
     * @param obj - 需要操作的对象
     * @param prop - 需要被隐藏并锁定的属性名
     */
    public static lock(obj: any, prop: string) {
        Reflect.defineProperty(obj, prop, {
            configurable: false,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * 解锁先前被lock方法锁定的属性
     * @param obj - 需要操作的对象
     * @param prop - 需要被解锁的属性名
     */
    public static unlock(obj: any, prop: string) {
        Reflect.defineProperty(obj, prop, {
            configurable: false,
            enumerable: false,
            writable: true,
        });
    }

    /**
     * 隐藏对象的一个属性
     * @param obj - 需要操作的对象
     * @param prop - 需要被隐藏的属性名
     */
    public static hide(obj: any, prop: string) {
        Reflect.defineProperty(obj, prop, {
            configurable: false,
            enumerable: false,
            writable: true,
        });
    }
}

export default Utility;
