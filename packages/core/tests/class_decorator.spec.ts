import sinon from 'sinon';
import { expect } from 'chai';

function logClass(...args: any[]) {
    // 保存原始定义
    const original = args[0];

    // 新构造函数的行为
    const f: any = function (...args: any[]) {
        console.log('New: ' + original.name);
        return Reflect.construct(original, args);
    };

    // 复制原型，使 instanceof 操作符仍然可用
    f.prototype = original.prototype;

    // 返回新构造函数（将替换原始构造函数）
    return f;
}

@logClass
class Person {
    public name: string;

    constructor(name: string) {
        this.name = name;

        this.test();
    }

    test() {
        console.log('test');
    }

    sayHello() {
        console.log(this.name + ' says hello');
    }

    sayGoodbye() {
        console.log(this.name + ' says goodbye');
    }
}

describe('logClass decorator', () => {
    let logStub: sinon.SinonStub;

    beforeEach(() => {
        logStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
        logStub.restore();
    });

    it('should log when class is instantiated', () => {
        new Person('Alice');
        expect(logStub.calledWith('New: Person')).to.be.true;
    });

    it('Person class should call test method when instantiated', () => {
        new Person('Alice');
        expect(logStub.calledWith('test')).to.be.true;
    });

    it('sayHello method should log correctly', () => {
        const person = new Person('Alice');
        person.sayHello();
        expect(logStub.calledWith('Alice says hello')).to.be.true;
    });

    it('sayGoodbye method should log correctly', () => {
        const person = new Person('Alice');
        person.sayGoodbye();
        expect(logStub.calledWith('Alice says goodbye')).to.be.true;
    });
});
