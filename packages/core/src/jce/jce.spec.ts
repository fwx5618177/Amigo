import sinon from 'sinon';
import { expect } from 'chai';
import { Readable } from 'stream';
import Jce from './Jce'; // 请确保路径正确
import { JCE_DATA_TYPE } from './config';

const template = `This one thing alone can prevent a lot of havoc. Elaine’s password book disappeared the day she died. The hospice nurse took it and then passed it on to others, who proceeded to get into her Apple ID account to order iPads.

The thieves also tried to open several credit cards since they now had access to her information.`;

const queryBinary = () => {
    const buffer = Buffer.from(template, 'utf-8');
    const byte = Array.from(buffer);

    return byte;
};

describe('Jce', () => {
    let jce: Jce;
    let readable: Readable;
    let sandbox: sinon.SinonSandbox;
    let spy: sinon.SinonSpy;

    beforeEach(() => {
        // 在每个测试用例开始前实例化 Jce
        jce = new Jce();
        readable = new Readable();
        sandbox = sinon.createSandbox();
        spy = sinon.spy(jce, 'readElement'); // 绑定 spy 到 readElement 方法
    });

    afterEach(() => {
        sandbox.restore();
        spy.restore(); // 清理 spy
    });

    describe('readHead', () => {
        it('should correctly read the type and tag from the JCE data', () => {
            // 创建一个 Buffer 包含 JCE 数据头部信息
            // 例如，这里我们用 0x21 表示 type 为 1，tag 为 2
            const buffer = Buffer.from([0x21]);
            const readable = new Readable();
            readable.push(buffer); // 将 buffer 推送到可读流
            readable.push(null); // 表示流的结束

            // 调用 readHead 方法解析 JCE 数据头部
            const { type, tag } = jce.readHead(readable);

            // 使用 chai 断言库来验证 type 和 tag 是否与预期一致
            expect(type).to.equal(1);
            expect(tag).to.equal(2);
        });

        it('should correctly read extended tag from the next byte', () => {
            // 创建一个 Buffer 包含 JCE 数据头部信息，这里 0xf1 表示 type 为 1，tag 为 0xf (即需要从下一个字节读取 tag)
            // 后面的 0x10 表示真正的 tag 值为 0x10
            const buffer = Buffer.from([0xf1, 0x10]);
            const readable = new Readable();
            readable.push(buffer);
            readable.push(null);

            const { type, tag } = jce.readHead(readable);

            expect(type).to.equal(1);
            expect(tag).to.equal(0x10); // 0x10 in decimal is 16
        });

        it('should read an element correctly', () => {
            readable.push(Buffer.from([0x00, 0x08])); // 0x00 - 头部，表示 tag 为 0, 类型为 INT8; 0x08 - 值为 8 的 INT8
            readable.push(null);
            const element = jce.readElement(readable);

            // 你需要知道期望的 tag 和 value，以便在此进行断言
            expect(element.tag).to.equal(0);
            expect(element.value).to.equal(8);
        });

        it('should read body correctly for given type', () => {
            readable.push(Buffer.from([0x02, 0x03])); // 示例的 binary data
            readable.push(null);
            const body = jce.readBody(readable, JCE_DATA_TYPE.INT16); // 第二个参数根据实际情况替换

            // 用具体的期望值替换以下断言
            expect(body).to.equal(515); // 示例
        });

        it('should read struct correctly', () => {
            // 你需要准备一个包含结构体的可读流
            readable.push(
                Buffer.from([
                    0x10, // 开始一个具有标签0的结构体
                    0x32, // 一个具有标签2的 INT32 类型元素
                    0x00,
                    0x00,
                    0x00,
                    0x01, // 值为1的 INT32 数据
                    0x32, // 一个具有标签2的 INT32 类型元素
                    0x00,
                    0x00,
                    0x00,
                    0x02, // 值为2的 INT32 数据
                    0x0b, // 结束标签为0的结构体
                ]),
            ); // 示例 binary data
            readable.push(null);
            const struct = jce.readStruct(readable);

            // 你需要知道期望的结构体内容，以便在此进行断言
            expect(struct).to.deep.equal({ 0: 1, 1: 50, 3: 2 }); // 示例
        });

        it('readStruct should return the expected structure', () => {
            const fakeStream = new Readable();
            const fakeStreamLong = new Readable();
            // 模拟一个二进制流，包含一个字符串和一个整数
            fakeStream.push(
                Buffer.from([
                    0x06, // 类型6（我假定这是一个短字符串: ），标签6
                    0x03, // 字符串长度为3
                    'f'.charCodeAt(0), // "foo"字符串的第一个字符
                    'o'.charCodeAt(0), // 第二个字符
                    'o'.charCodeAt(0), // 第三个字符
                    0x21, // 类型1（我假定这是一个16位整数），标签2
                    0x01,
                    0x02, // 一个16位整数的值是 0x0102，即258 in decimal
                    0x32, // 类型2（我假定这是一个32位整数），标签3
                    0x00,
                    0x00,
                    0x01,
                    0x02, // 一个32位整数的值是 0x00000102，即258 in decimal
                    0x0b, // 结束一个结构体，标签4
                ]),
            );
            fakeStream.push(null); // 添加 null 以表示流的结束

            const str = queryBinary();
            fakeStreamLong.push(
                Buffer.from([
                    0x70, // 开始一个结构体，标签0
                    0x07, // 类型7（长字符串），标签0
                    0x21, // 类型1（16位整数），标签2
                    0x01,
                    0x02, // 一个16位整数的值是 0x0102，即258 in decimal
                    0x32, // 类型2（32位整数），标签3
                    0x00,
                    0x00,
                    0x01,
                    0x02, // 一个32位整数的值是 0x00000102，即258 in decimal
                    0x37, // 类型7（长字符串），标签3
                    0x00,
                    0x00,
                    0x01,
                    0x02, // 字符串长度为258
                    // 以下是258个 'a' 字符的ASCII值
                    ...str.slice(0, 258),

                    0x0b, // 结束一个结构体，标签4
                ]),
            );
            fakeStreamLong.push(null); // 添加 null 以表示流的结束

            const result = jce.readStruct(fakeStream);
            const resultLong = jce.readStruct(fakeStreamLong);

            // 期望返回一个对象，包含一个字符串和一个整数
            expect(result).to.eql({ 0: 'foo', 2: 258, 3: 258 });
            expect(resultLong).to.deep.equal({
                2: 258,
                3: 'This one thing alone can prevent a lot of havoc. Elaine’s password book disappeared the day she died. The hospice nurse took it and then passed it on to others, who proceeded to get into her Apple ID account to order iPads.\n\nThe thieves also tried to open ',
                '7': 7,
            });
        });

        it('readElement should return expected element', () => {
            const fakeStream = new Readable();
            // 模拟一个二进制流，包含一个字符串“foo”
            fakeStream.push(Buffer.from([0x06, 0x03, 0x66, 0x6f, 0x6f]));
            fakeStream.push(null); // 添加 null 以表示流的结束

            const element = jce.readElement(fakeStream);

            // 期望返回一个对象，其值是字符串“foo”
            expect(element).to.eql({ tag: 0, value: 'foo' });

            expect(spy.calledOnce).to.be.true; // 检查 readElement 是否被调用了一次
            expect(spy.firstCall.args[0]).to.equal(fakeStream); // 检查 readElement 的参数是否是 fakeStream
        });
    });
});
