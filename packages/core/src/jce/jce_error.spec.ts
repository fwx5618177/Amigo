import sinon from 'sinon';
import { expect } from 'chai';
import JceError from './JceError';

describe('JceError', () => {
    let consoleLogStub: sinon.SinonStub;

    // 在每个测试前，我们都会"存根" console.log 以便我们可以监视其调用
    beforeEach(() => {
        consoleLogStub = sinon.stub(console, 'log');
    });

    // 在每个测试之后，我们都会恢复 console.log 到它的原始状态
    afterEach(() => {
        consoleLogStub.restore();
    });

    it('should throw a custom JceError', () => {
        // 定义一个函数，其内部会抛出 JceError
        function throwError() {
            throw new JceError('This is a test error');
        }

        // 使用 expect 函数来捕获并断言错误
        expect(throwError).to.throw(JceError, 'This is a test error');
        expect(consoleLogStub.calledWithMatch('[Error Class]')).to.be.true;
    });
});
