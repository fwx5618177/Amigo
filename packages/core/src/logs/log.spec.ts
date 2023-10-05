import sinon from 'sinon';
import { expect } from 'chai';
import { Log } from './Logs';

class Example {
    @Log.logInfo
    normalMethod(param1: string, param2: number): string {
        console.log('Normal method executed');
        return param1 + param2;
    }

    @Log.logWarn
    anotherMethod(param1: string, param2: number): string {
        console.log('Another method executed');
        return param1 + param2;
    }

    @Log.logError
    methodWithError(param1: string, param2: number): never {
        console.log('Method with error executed');
        // 制造一个错误
        throw new Error('This is a test error');
    }
}

describe('Example class', () => {
    const example = new Example();
    let consoleLogStub: sinon.SinonStub;

    // 在每个测试前，我们都会"存根" console.log 以便我们可以监视其调用
    beforeEach(() => {
        consoleLogStub = sinon.stub(console, 'log');
    });

    // 在每个测试之后，我们都会恢复 console.log 到它的原始状态
    afterEach(() => {
        consoleLogStub.restore();
    });

    it('should execute normalMethod and return the correct result', () => {
        const result = example.normalMethod('test', 123);
        expect(result).to.equal('test123');
        // 检查是否调用了 console.log，并确保第一个参数是'[Info]'
        expect(consoleLogStub.calledWithMatch('[Info]')).to.be.true;
    });

    it('should execute anotherMethod and return the correct result', () => {
        const result = example.anotherMethod('test', 456);
        expect(result).to.equal('test456');
        expect(consoleLogStub.calledWithMatch('[Warning]')).to.be.true;
    });

    it('should catch an error thrown by methodWithError', () => {
        expect(() => example.methodWithError('error', 789)).to.throw(Error, 'This is a test error');

        // 检查是否调用了 console.log，并确保第一个参数是'[Error]'
        expect(consoleLogStub.calledWithMatch('[Error]')).to.be.true;
    });
});
