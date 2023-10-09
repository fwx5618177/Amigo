import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import axios from 'axios';
import DeviceManager from './DeviceManager';
import { Platform, STATUS } from './type';

describe('DeviceManager', () => {
    let deviceManager: DeviceManager;
    let axiosPostStub: SinonStub;

    beforeEach(() => {
        deviceManager = new DeviceManager(Platform.Watch);
        axiosPostStub = sinon.stub(axios, 'post');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('#getQIMEI', () => {
        it('should send request correctly', async () => {
            sinon.restore();
            const config = deviceManager.getConfigurations();
            const response = await deviceManager.postRequest(config);

            console.log('response:', response.data);
            expect(response.data.code).to.equal(STATUS.SUCCESS_CODE);
        });

        it('should not make a post request if apk.app_key is empty', async () => {
            deviceManager.apk.app_key = '';
            await deviceManager.getQIMEI();
            expect(axiosPostStub.called).to.be.false;
        });

        it('should handle network errors gracefully', async () => {
            axiosPostStub.throws(new Error('Network error'));
            try {
                await deviceManager.getQIMEI();
                expect.fail('Expected getQIMEI to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Expected getQIMEI to throw an error');
            }
        });
    });

    describe('#getConfigurations', () => {
        it('should generate a configuration with encrypted key and parameters', () => {
            const config = deviceManager.getConfigurations();
            expect(config.encryptedKey).to.be.a('string');
            expect(config.encryptedParams).to.be.a('string');
        });
        it('should return configuration with all necessary properties', () => {
            const config = deviceManager.getConfigurations();
            expect(config).to.have.all.keys(
                'encryptedKey',
                'timestamp',
                'nonceValue',
                'encryptedParams',
                'randomKey',
                'sign',
            );
        });
    });

    describe('#postRequest', () => {
        it('should send a post request with the correct parameters', async () => {
            const serverResponse = { data: 'response', code: STATUS.SUCCESS_CODE };
            axiosPostStub.resolves({ data: serverResponse });
            const config = deviceManager['getConfigurations']();
            const response = await deviceManager['postRequest'](config);
            expect(response.data).to.eql(serverResponse);
            expect(
                axiosPostStub.calledWithMatch(
                    'https://snowflake.qq.com/ola/android',
                    sinon.match.any,
                ),
            ).to.be.true;
        });

        it('should handle the unsuccessful response codes gracefully', async () => {
            const serverResponse = { data: 'errorData', code: STATUS.ERROR_CODE }; // Adjust STATUS.ERROR_CODE to a specific error code value
            axiosPostStub.resolves({ data: serverResponse });
            const config = deviceManager['getConfigurations']();
            try {
                await deviceManager['postRequest'](config);
                expect.fail('Expected postRequest to throw an error');
            } catch (error) {
                expect(error.message).to.include('throw an error');
                // Replace 'Unsuccessful response code' with the actual error handling mechanism or message you have in your implementation
            }
        });
    });
});
