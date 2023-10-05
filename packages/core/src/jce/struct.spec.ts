import { expect } from 'chai';
import Struct from './Struct'; // 更新路径以匹配 Struct 类的实际路径

describe('Struct class', () => {
    it('should not have any inherited properties or methods', () => {
        const struct = Object.create(Struct.prototype);

        // 由于 Struct 继承自 null，所以 struct 的原型应该是 null
        expect(Object.getPrototypeOf(struct)).to.not.equal(null);
        expect(Object.getPrototypeOf(struct)).to.equal(Struct.prototype);

        // struct 本身不应该有任何自有属性
        expect(Object.keys(struct).length).to.equal(0);
    });

    it('should be able to add properties and methods', () => {
        const struct = Object.create(Struct.prototype);

        // 添加一个属性
        struct.property = 'value';
        expect(struct.property).to.equal('value');

        // 添加一个方法
        struct.method = () => 'Hello, world!';
        expect(struct.method()).to.equal('Hello, world!');
    });
});
