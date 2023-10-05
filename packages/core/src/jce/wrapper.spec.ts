import { expect } from 'chai';
import { describe, it } from 'mocha';
import Wrapper from './wrapper'; // 请根据实际路径更改

describe('Wrapper Class', () => {
    const wrapper = new Wrapper();

    describe('encode and decode methods', () => {
        it('should correctly encode and decode a JCE struct', () => {
            // 定义一个示例 JCE 结构体
            const exampleStruct = {
                0: 'Hello',
                1: 123,
                2: [1, 2, 3],
                3: { key: 'value' },
            };

            // 使用 encode 方法编码 JCE 结构体
            const encoded = wrapper.encode(exampleStruct);

            // 使用 decode 方法解码 JCE 数据
            const decoded = wrapper.decode(encoded);

            // 使用 Chai 断言库检查解码后的数据是否与原始数据相等
            expect(decoded).to.deep.equal(exampleStruct);
        });

        it('should correctly encode and decode a nested JCE struct', () => {
            // 定义一个包含嵌套结构的 JCE 结构体
            const nestedStruct = {
                0: 'Hello',
                1: 123,
                2: wrapper.encodeNested({ 0: 'Nested', 1: 456 }),
            };

            // 使用 encode 方法编码包含嵌套结构的 JCE 结构体
            const encoded = wrapper.encode(nestedStruct);

            // 使用 decode 方法解码 JCE 数据
            const decoded = wrapper.decode(encoded);

            // 使用 Chai 断言库检查解码后的数据是否与原始数据相等
            // 注意：因为我们有嵌套结构，所以我们可能需要添加逻辑来解码嵌套结构
            expect(decoded[0]).to.equal(nestedStruct[0]);
            expect(decoded[1]).to.equal(nestedStruct[1]);
            // 这里可以添加更多的断言来检查嵌套结构的解码结果
        });
    });
});
