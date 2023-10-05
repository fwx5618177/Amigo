import { Readable } from 'stream';
import { JCEStruct } from './type';
import Jce from './Jce';
import Nest from './Nest';

/**
 * @description
 * Wrapper 类用于管理和处理 JCE 编码中的嵌套结构。
 * 它提供了创建和管理 JCE 数据头的方法。
 *
 * @example
 * const wrapper = new Wrapper();
 * const decoded = wrapper.decode(encode);
 * console.log(decoded);
 * const encoded = wrapper.encode(decoded);
 * console.log(encoded);
 * const nested = wrapper.encodeNested(decoded);
 * console.log(nested);
 *
 */
class Wrapper {
    // 实例化 Jce 和 Nest 类
    private jce = new Jce();
    private nest = new Nest();

    /**
     * 解码 JCE 编码的数据。
     *
     * @param encode - 一个包含 JCE 编码数据的缓冲区。
     * @returns 返回一个解码后的 JCE 结构。
     */
    public decode(encode: Buffer) {
        // 创建一个可读流以方便读取缓冲区的内容。
        const readable = Readable.from(encode, {
            objectMode: false,
        });

        // 一种启动流或使流进入可读状态的方法
        readable.read(0);
        // 初始化 decoded 对象，它将存储解码后的数据。
        const decoded: JCEStruct = Object.create(null);

        // 读取流中的数据，直到没有更多数据可以读取。
        while (readable.readableLength) {
            // 使用 Jce 类的 readElement 方法读取并解码一个 JCE 元素。
            const { tag, value } = this.jce.readElement(readable);

            // 将解码后的元素存储在 decoded 对象中。
            decoded[tag] = value;
        }

        return decoded;
    }

    /**
     * 编码 JCE 结构。
     *
     * @param obj - 一个 JCE 结构或数组，包含需要被编码的数据。
     * @returns 返回一个包含 JCE 编码数据的缓冲区。
     */
    public encode(obj: JCEStruct | any[]) {
        const elements = [];

        // 判断输入数据是对象还是数组，并相应地处理
        if (Array.isArray(obj)) {
            for (let tag = 0; tag < obj.length; ++tag) {
                if (obj[tag] === null || obj[tag] === undefined) continue;

                // 使用 Nest 类的 createElement 方法编码每个元素。
                elements.push(this.nest.createElement(tag, obj[tag]));
            }
        } else {
            for (const tag of Object.keys(obj).map(Number)) {
                if (obj[tag] === null || obj[tag] === undefined) continue;

                // 使用 Nest 类的 createElement 方法编码每个元素。
                elements.push(this.nest.createElement(tag, obj[tag]));
            }
        }

        // 将所有编码后的元素连接成一个缓冲区并返回。
        return Buffer.concat(elements);
    }

    /**
     * 编码嵌套的 JCE 结构。嵌套结构必须使用此方法进行编码。
     *
     * @param obj - 一个 JCE 结构或数组，包含需要被编码的嵌套数据。
     * @returns 返回一个 Nest 实例，其中包含编码后的数据。
     */
    public encodeNested(obj: JCEStruct | any[]) {
        // 使用 encode 方法编码数据，然后将编码后的缓冲区传递给 Nest 类的构造函数，
        // 创建一个新的 Nest 实例，并返回这个实例。
        return new Nest(this.encode(obj));
    }
}

export default Wrapper;
