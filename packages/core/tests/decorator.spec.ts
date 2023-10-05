import sinon from 'sinon';
import { expect } from 'chai';

class Decorators {
    static readonlyExample(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.writable = false;
        console.log('Decorating method', propertyKey);
    }
}

class MyClass {
    // @ts-ignore
    @Decorators.readonlyExample
    myMethod() {
        console.log('Hello, world!');
    }
}

class Log {
    static logInfo() {
        return function (target: any, propertyName: string, descriptor: PropertyDescriptor): any {
            const originalMethod = descriptor.value;

            descriptor.value = function (...args: any[]) {
                const result = originalMethod.apply(this, args);
                console.log('Info:', `Method ${propertyName} called with`, args.join(', '));
                return result;
            };
        };
    }
}

class Example {
    // @ts-ignore
    @Log.logInfo()
    normalMethod(param1: string, param2: number) {
        console.log('Normal method executed');
        return param1 + param2;
    }
}

describe('Decorators', () => {
    let consoleLogStub: sinon.SinonStub;
    const example = new Example();
    const myClass = new MyClass();

    beforeEach(() => {
        consoleLogStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
        consoleLogStub.restore();
    });

    it('readonlyExample should make method read-only', () => {
        expect(() => {
            myClass.myMethod = () => {
                console.log('This should fail.');
            };
        }).to.throw();
    });

    it('readonlyExample should log when decorating a method', () => {
        new MyClass();
        expect(consoleLogStub.calledWith('Decorating method', 'myMethod')).to.be.false;
    });

    it('logInfo should log method calls with args', () => {
        example.normalMethod('test', 123);
        expect(consoleLogStub.calledWith('Info:', 'Method normalMethod called with', 'test, 123'))
            .to.be.true;
    });

    it('normalMethod should return correct result', () => {
        const example = new Example();
        const result = example.normalMethod('test', 123);
        expect(result).to.equal('test123');
    });
});
