import sinon from 'sinon';
import { expect } from 'chai';
import JceError from './JceError';
import { JCE_DATA_TAG, JCE_DATA_TYPE } from './config';
import Nest from './Nest';

describe('Nest class', () => {
    let nest;
    let consoleLogStub: sinon.SinonStub;

    beforeEach(() => {
        // 每个测试用例执行之前都会实例化一个新的 Nest 对象
        nest = new Nest(Buffer.alloc(0));
        consoleLogStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
        consoleLogStub.restore();
    });

    describe('createHead method', () => {
        it('should create a head with type and tag', () => {
            const head = nest.createHead(1, 2);
            const expected = Buffer.from([0x21]); // 0x21 (0010 0001) => type: 1, tag: 2
            expect(head).to.deep.equal(expected);
            expect(consoleLogStub.calledWithMatch('[Error Class]')).to.be.false;
        });

        it('should throw an error if tag is greater than 255', () => {
            expect(() => nest.createHead(1, 256)).to.throw(
                JceError,
                'Tag must be less than 256, received: 256',
            );
        });
    });

    describe('createBody method', () => {
        it('should create a body for INT8 type', () => {
            const body = nest.createBody(JCE_DATA_TYPE.INT8, 5);
            expect(body).to.deep.equal(Buffer.from([5]));
        });

        // 添加更多的数据类型和值来测试不同情况
        it('should create a body for SHORT_STRING type', () => {
            const body = nest.createBody(JCE_DATA_TYPE.SHORT_STRING, Buffer.from('test'));
            expect(body).to.deep.equal(Buffer.concat([Buffer.from([4]), Buffer.from('test')]));
            expect(consoleLogStub.calledWithMatch('[Error Class]')).to.be.false;
        });

        it('should throw an error for unsupported type', () => {
            expect(() => nest.createBody(14, 'unsupported')).to.throw(
                JceError,
                'Type must be 0 ~ 13, received: 14',
            );
        });
    });

    describe('createElement method', () => {
        it('should create an element for number type with MAP_KEY tag', () => {
            const element = nest.createElement(JCE_DATA_TAG.MAP_KEY, 5);
            // 根据输入值5，它是一个小整数，所以我们预期会使用 INT8 类型来存储这个值
            // 由于我们没有特定的数据类型标签，我们只需要确保值被正确编码
            const expected = Buffer.concat([Buffer.from([0]), Buffer.from([5])]);
            expect(element).to.deep.equal(expected);
        });

        it('should create an element for string type with MAP_VALUE tag', () => {
            const element = nest.createElement(JCE_DATA_TAG.MAP_VALUE, 'test');
            const expected = Buffer.concat([
                Buffer.from([22]),
                Buffer.from([4]),
                Buffer.from('test'),
            ]);
            expect(element).to.deep.equal(expected);
        });

        it('should throw an error for unsupported type', () => {
            expect(() => nest.createElement(JCE_DATA_TAG.MAP_KEY, Symbol())).to.throw(
                JceError,
                'Unsupported type: symbol',
            );
            expect(consoleLogStub.calledWithMatch('[Error Class]')).to.be.true;
        });
    });
});
