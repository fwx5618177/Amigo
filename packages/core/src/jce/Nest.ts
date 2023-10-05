import JceError from './JceError';
import { JCE_DATA_TAG, JCE_DATA_TYPE, JCE_BIT_MASK } from './config';

/**
 * Nest 类用于管理和处理 JCE 编码中的嵌套结构。
 * 它提供了创建和管理 JCE 数据头的方法。
 */
class Nest {
    public data: Buffer; // 用于存储 JCE 编码数据的缓冲区

    /**
     * 构造函数接收一个缓冲区作为参数，该缓冲区用于存储 JCE 编码的数据。
     * @param data - 缓冲区，用于存储 JCE 编码的数据
     */
    constructor(data: Buffer = Buffer.alloc(0)) {
        this.data = data;
    }

    /**
     * 创建 JCE 数据的头部。头部包含元素的类型和标签。
     * @param {JCE_DATA_TYPE} type - JCE 数据元素的类型
     * @param {JCE_DATA_TAG} tag - JCE 数据元素的标签
     * @returns 返回一个包含 JCE 数据头部的缓冲区
     */
    public createHead(type: JCE_DATA_TYPE, tag: JCE_DATA_TAG) {
        // 如果标签小于 15，可以直接在一个字节内编码类型和标签
        if (tag < 15) {
            // 使用位操作将标签和类型信息编码到一个字节中，并返回该字节的缓冲区
            return Buffer.from([(tag << JCE_BIT_MASK.MOVE_BIT) | type]);
            // 如果标签小于 256，需要使用两个字节来编码类型和标签
        } else if (tag < 256) {
            // 第一个字节的低 4 位存储类型信息，高 4 位设置为 1111（0xf0）
            // 第二个字节完整存储标签信息
            return Buffer.from([JCE_BIT_MASK.HIGH_BIT_AND | type, tag]);
        } else {
            // 如果标签大于等于 256，抛出错误
            throw new JceError('Tag must be less than 256, received: ' + tag);
        }
    }

    /**
     * 创建 JCE 编码数据的主体部分。根据给定的类型和值，生成相应格式的缓冲区。
     *
     * @param type - JCE 数据元素的类型，值的范围应为 0~13，每种值代表一种数据类型
     * @param value - 需要被编码的值，可以是任意类型，函数内部会根据 `type` 参数处理这个值
     *
     * @returns 返回一个缓冲区，其中包含了按 JCE 格式编码的 `value` 数据
     *
     * @throws 如果 `type` 参数不在 0~13 的范围内，会抛出一个错误
     */
    public createBody(type: JCE_DATA_TYPE, value: any) {
        let body, len;

        switch (type) {
            case JCE_DATA_TYPE.INT8:
                // 对于 8 位整数，直接将值转换为一个字节的缓冲区
                return Buffer.from([Number(value)]);
            case JCE_DATA_TYPE.INT16:
                // 对于 16 位整数，创建一个两字节的缓冲区并写入整数值
                body = Buffer.allocUnsafe(2);
                body.writeInt16BE(Number(value));
                return body;
            case JCE_DATA_TYPE.INT32:
                // 对于 32 位整数，创建一个四字节的缓冲区并写入整数值
                body = Buffer.allocUnsafe(4);
                body.writeInt32BE(Number(value));
                return body;
            case JCE_DATA_TYPE.INT64:
                // 对于 64 位整数，创建一个八字节的缓冲区并写入整数值
                body = Buffer.allocUnsafe(8);
                body.writeBigInt64BE(BigInt(value));
                return body;
            case JCE_DATA_TYPE.FLOAT:
                // 对于单精度浮点数，创建一个四字节的缓冲区并写入浮点数值
                body = Buffer.allocUnsafe(4);
                body.writeFloatBE(value);
                return body;
            case JCE_DATA_TYPE.DOUBLE:
                // 对于双精度浮点数，创建一个八字节的缓冲区并写入浮点数值
                body = Buffer.allocUnsafe(8);
                body.writeDoubleBE(value);
                return body;
            case JCE_DATA_TYPE.SHORT_STRING:
                // 对于短字符串，创建一个缓冲区，其中包含字符串的长度和内容
                len = Buffer.from([value.length]);
                return Buffer.concat([len, value]);
            case JCE_DATA_TYPE.LONG_STRING:
                // 对于长字符串，创建一个缓冲区，其中包含字符串的长度（四字节无符号整数）和内容
                len = Buffer.allocUnsafe(4);
                len.writeUInt32BE(value.length);
                return Buffer.concat([len, value]);
            case JCE_DATA_TYPE.MAP:
                // 处理映射类型，迭代映射的键值对并将它们编码到一个缓冲区数组中
                body = [];
                let n = 0;
                for (const k of Object.keys(value)) {
                    ++n;
                    body.push(this.createElement(JCE_DATA_TAG.MAP_KEY, k));
                    body.push(this.createElement(JCE_DATA_TAG.MAP_VALUE, value[k]));
                }
                // 添加映射的长度信息到缓冲区数组的开始位置
                body.unshift(this.createElement(JCE_DATA_TAG.LENGTH, n));
                return Buffer.concat(body);
            case JCE_DATA_TYPE.LIST:
                // 处理列表类型，迭代列表的元素并将它们编码到一个缓冲区数组中
                body = [this.createElement(JCE_DATA_TAG.LENGTH, value.length)];
                for (let i = 0; i < value.length; ++i) {
                    body.push(this.createElement(JCE_DATA_TAG.LIST_ELEMENT, value[i]));
                }
                return Buffer.concat(body);
            // case JCE_DATA_TYPE.STRUCT_BEGIN:
            // case JCE_DATA_TYPE.STRUCT_END:
            case JCE_DATA_TYPE.ZERO:
                // 针对类型 12（ZERO），返回一个空的缓冲区
                return Buffer.alloc(0);
            case JCE_DATA_TYPE.SIMPLE_LIST:
                // 处理简单列表，创建一个包含列表长度和内容的缓冲区
                return Buffer.concat([
                    this.createHead(0, JCE_DATA_TAG.BYTES),
                    this.createElement(JCE_DATA_TAG.LENGTH, value.length),
                    value,
                ]);
            default:
                // 如果类型不在 0~13 的范围内，抛出一个错误
                throw new JceError('Type must be 0 ~ 13, received: ' + type);
        }
    }

    /**
     * 根据给定的标签和值创建一个 JCE 编码的元素。
     *
     * @param tag - JCE 数据元素的标签，用于标识数据元素的用途或名称
     * @param data - 需要被编码的值，可以是任意类型，函数内部会根据值的类型选择合适的 JCE 数据类型进行编码
     *
     * @returns 返回一个缓冲区，其中包含了按 JCE 格式编码的数据元素
     *
     * @throws 如果 `value` 的类型不受支持，或者 `value` 的数值超出 JCE 格式可以表示的范围，会抛出一个错误
     */
    public createElement(tag: JCE_DATA_TAG, data: any): Buffer {
        let type: JCE_DATA_TYPE;
        let value: Buffer = data;

        if (value instanceof Nest) {
            // 如果值是一个 Nest 实例（即一个嵌套的结构体），则创建一个结构体类型的 JCE 元素
            // 结构体的开始和结束都需要一个头部，其间是结构体的内容
            const begin = this.createHead(JCE_DATA_TYPE.STRUCT_BEGIN, tag);
            const end = this.createHead(JCE_DATA_TYPE.STRUCT_END, JCE_DATA_TAG.STRUCT_END);
            return Buffer.concat([begin, value.data, end]);
        }

        switch (typeof value) {
            case 'string':
                // 如果值是字符串，则创建一个字符串类型的 JCE 元素
                // 根据字符串的长度选择使用短字符串类型或长字符串类型
                value = Buffer.from(value);
                type = value.length < 0xff ? JCE_DATA_TYPE.SHORT_STRING : JCE_DATA_TYPE.LONG_STRING;
                break;
            case 'object':
                // 如果值是对象，则根据对象的具体类型选择使用映射类型、列表类型或简单列表类型
                if (value instanceof Uint8Array) type = JCE_DATA_TYPE.SIMPLE_LIST;
                else type = Array.isArray(value) ? JCE_DATA_TYPE.LIST : JCE_DATA_TYPE.MAP;
                break;
            case 'bigint':
            case 'number':
                // 如果值是整数或浮点数，则根据数值的范围选择使用适当大小的整数类型或浮点数类型
                // 0 有一个专门的类型，其他整数根据范围选择使用 8、16、32 或 64 位整数类型
                // 浮点数只有一种类型
                if (value == 0) type = JCE_DATA_TYPE.ZERO;
                else if (Number.isInteger(value) || typeof value === 'bigint') {
                    if (value >= -0x80 && value <= 0x7f) type = JCE_DATA_TYPE.INT8;
                    else if (value >= -0x8000 && value <= 0x7fff) type = JCE_DATA_TYPE.INT16;
                    else if (value >= -0x80000000 && value <= 0x7fffffff)
                        type = JCE_DATA_TYPE.INT32;
                    else if (value >= -0x8000000000000000n && value <= 0x7fffffffffffffffn)
                        type = JCE_DATA_TYPE.INT64;
                    else throw new JceError('Number out of range: ' + value);
                } else {
                    type = JCE_DATA_TYPE.DOUBLE;
                }
                break;
            default:
                // 如果值的类型不受支持，则抛出一个错误
                throw new JceError('Unsupported type: ' + typeof value);
        }

        // 创建元素的头部和主体部分
        const head = this.createHead(type, tag);
        const body = this.createBody(type, value);

        // 返回一个缓冲区，其中按顺序包含了头部和主体
        return Buffer.concat([head, body]);
    }
}

export default Nest;
