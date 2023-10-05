import { Readable } from 'stream';
import { JCE_BIT_MASK, JCE_DATA_TAG, JCE_DATA_TYPE, JCE_FLAG_STRUCT } from './config';
import Struct from './Struct';

/**
 * 处理 JCE (Java Complex Encoding) 编码的数据。JCE 是一种二进制编码格式，常用于在网络上传输复杂的数据结构
 *
 * @description
 * 1. JCE 二进制编码格式的数据结构由一系列的元素组成，每个元素由一个 tag 和一个 value 组成
 * 2. tag 用于标识元素的类型，value 用于存储元素的值
 * 3. tag 和 value 之间的关系由 tag 的类型决定
 *
 * @description
 * 一个完整的 JCE 编解码库的实现。
 * 它可以处理各种复杂的数据结构，包括列表、映射和嵌套的结构，并将它们编码为紧凑的二进制格式，或者将这种格式解码为 JavaScript 对象。
 * 这种格式非常适合于在网络上传输复杂的数据结构，特别是在带宽有限或需要高效传输的情况下。
 *
 * @example
 * ```ts
 * const jce = new JCE();
 * const data = jce.encode({
 *    a: 1,
 *   b: '2',
 *  c: [1, 2, 3],
 * d: {
 *   e: 1,
 *  f: 2,
 * },
 * });
 * console.log(data);
 *
 * const obj = jce.decode(data);
 * console.log(obj);
 * ```
 *
 */
class Jce {
    /**
     * 读取 `readable` 流的头部信息并返回一个包含类型和标签的对象。
     * 头部信息是从流中读取的第一个字节，它包含了该流的类型和标签信息。
     *
     * @param {Readable} readable - 一个可读流，包含 JCE 格式的数据。
     *
     * @returns {Object} 返回一个对象，其中:
     *  - `type`: 是头部信息中的低四位，表示数据的类型。
     *  - `tag`: 是头部信息中的高四位，表示数据的标签。
     *
     * @example
     * const jce = new Jce();
     * const { type, tag } = jce.readHead(readableStream);
     * console.log('Type:', type, 'Tag:', tag);
     */
    public readHead(readable: Readable): {
        type: JCE_DATA_TYPE;
        tag: JCE_DATA_TAG;
    } {
        const buffer = readable.read(JCE_BIT_MASK.READ_BIT_BYTE);

        if (!buffer) {
            return {
                type: JCE_DATA_TYPE.ZERO,
                tag: JCE_DATA_TAG.STRUCT_END,
            };
        }

        // 从可读流中读取一个字节的数据，该字节包含类型和标签的信息
        const head = buffer.readUInt8();

        // 通过位运算获取该字节中的低 4 位，这 4 位表示 JCE 数据的类型
        const type = head & JCE_BIT_MASK.LOW_BIT_AND;

        // 通过位运算和右移操作获取该字节中的高 4 位，这 4 位表示 JCE 数据的标签
        let tag = (head & JCE_BIT_MASK.HIGH_BIT_AND) >> JCE_BIT_MASK.MOVE_BIT;

        // 如果标签的值为 15 (0xf)，则表示标签的真正值存储在下一个字节中
        // 这种情况下，需要继续从可读流中读取下一个字节来获取标签的真正值
        if (tag === JCE_BIT_MASK.EXTENDED) {
            tag = readable.read(JCE_BIT_MASK.READ_BIT_BYTE)?.readUInt8();
        }

        // 返回包含类型和标签信息的对象
        return { tag, type };
    }

    /**
     * 从给定的流中读取一个 JCE 元素，包括其头部和主体。
     * JCE 元素由一个头部和一个主体组成。头部包含元素的类型和标签，主体包含元素的实际数据。
     *
     * @param stream - 一个可读流，其中包含 JCE 编码的数据。
     *
     * @returns 返回一个对象，其中包含从流中读取的元素的标签和值。
     */
    public readElement(stream: Readable) {
        // 从流中读取元素的头部。头部包含元素的类型和标签。
        const head = this.readHead(stream);
        // 如果头部为 null，表示流已经结束
        if (!head) {
            return {
                tag: JCE_DATA_TAG.STRUCT_END,
                value: JCE_FLAG_STRUCT.FLAG_STRUCT_END,
            };
        }
        // 读取元素的主体。传递元素的类型，以便能够正确解析数据。
        const value = this.readBody(stream, head.type);

        // 返回一个对象，包含元素的标签和值。这样调用者就可以知道元素的类型和数据。
        return {
            tag: head.tag,
            value,
        };
    }

    /**
     * 读取 JCE 格式的结构体数据。
     *
     * 该方法从可读流中解析并返回一个结构体。它读取流中的每个元素，
     * 并将它们作为属性添加到返回的结构体中。这个方法会一直读取，
     * 直到遇到结构体结束标志或流的末尾。
     *
     * @param stream - 一个包含 JCE 编码数据的可读流。
     *
     * @returns 返回一个解析出的结构体对象。这个结构体的每个属性都是从流中读取的元素，
     * 其中属性的名称是元素的标签，属性的值是元素的值。
     *
     * @example
     * const struct = jce.readStruct(stream);
     * console.log(struct[0]); // 输出第一个元素的值
     */
    public readStruct(stream: Readable) {
        const struct = Object.create(Struct.prototype);

        while (stream.readableLength) {
            const { tag, value } = this.readElement(stream);

            if (value === JCE_FLAG_STRUCT.FLAG_STRUCT_END) {
                return struct;
            } else {
                struct[tag] = value;
            }
        }
    }

    /**
     * 读取 JCE 编码数据的主体部分。
     *
     * 该方法根据提供的数据类型从流中读取并返回相应的值。
     * 它处理所有 JCE 数据类型，包括基本类型、列表、映射和结构体。
     *
     * @param stream - 一个包含 JCE 编码数据的可读流。
     * @param type - 要读取的 JCE 数据类型的编码。
     *
     * @returns 返回从流中读取的值。返回的值的类型取决于参数 type 的值。
     *
     * @throws 会抛出错误如果给定的数据类型是未知的。
     */
    public readBody(stream: Readable, type: number) {
        // 根据不同的 JCE 数据类型，从流中读取并返回相应的值。
        let len: number; // 用于保存列表、映射和字符串的长度。
        switch (type) {
            // 根据数据类型的不同，执行相应的读取操作。
            case JCE_DATA_TYPE.ZERO:
                return 0; // 对于零类型，直接返回0。
            case JCE_DATA_TYPE.INT8:
                return stream.read(1 << JCE_DATA_TYPE.INT8)?.readInt8(); // 对于 8 位整数，读取一个字节并返回其值。
            case JCE_DATA_TYPE.INT16:
                return stream.read(1 << JCE_DATA_TYPE.INT16)?.readInt16BE();
            case JCE_DATA_TYPE.INT32:
                return stream.read(1 << JCE_DATA_TYPE.INT32)?.readInt32BE();
            case JCE_DATA_TYPE.INT64:
                let value = stream.read(1 << JCE_DATA_TYPE.INT64).readBigInt64BE();
                if (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)
                    value = Number(value);
                return value;
            case JCE_DATA_TYPE.SHORT_STRING:
                len = stream.read(1).readUInt8(); // 对于长度小于256的字符串，首先读取一个字节表示长度，然后读取相应长度的字节并转换为字符串。
                return len > 0 ? stream.read(len).toString() : '';
            case JCE_DATA_TYPE.LONG_STRING:
                len = stream.read(4).readUInt32BE();
                return len > 0 ? stream.read(len).toString() : '';
            case JCE_DATA_TYPE.SIMPLE_LIST:
                // 简单列表首先读取头部信息，然后根据读取的长度信息，读取相应数量的数据。
                this.readHead(stream); // 读取列表头部信息，但没有使用这个信息
                len = this.readElement(stream).value; // 读取 SIMPLE_LIST 的长度
                return len > 0 ? stream.read(len) : Buffer.alloc(0); // 根据长度读取数据或返回一个空缓冲区
            case JCE_DATA_TYPE.LIST:
                // 对于普通列表，首先读取其长度，然后逐一读取列表中的元素。
                len = this.readElement(stream).value; // 读取列表的长度
                const list = [];
                while (len > 0) {
                    // 读取列表中的元素
                    list.push(this.readElement(stream).value);
                    --len;
                }
                return list;
            case JCE_DATA_TYPE.MAP:
                // 对于映射，类似地首先读取其长度，然后逐一读取映射中的键值对。
                len = this.readElement(stream)?.value; // 读取映射的长度
                const map = Object.create(null);
                while (len > 0) {
                    // 读取映射中的键和值
                    map[this.readElement(stream)?.value] = this.readElement(stream)?.value;
                    --len;
                }
                return map;
            case JCE_DATA_TYPE.STRUCT_BEGIN:
                // 读取并返回一个结构体。
                return this.readStruct(stream);
            case JCE_DATA_TYPE.STRUCT_END:
                // 返回一个表示结构体结束的标志。
                return JCE_FLAG_STRUCT.FLAG_STRUCT_END;
            case JCE_DATA_TYPE.FLOAT:
                return stream.read(4).readFloatBE();
            case JCE_DATA_TYPE.DOUBLE:
                return stream.read(8).readDoubleBE();
            default:
                throw new Error(`Unknown JCE Type: ${type}`);
        }
    }
}

export default Jce;
