import { expect } from 'chai';
import Configuration from './Configuration'; // 更新为实际的路径
import path from 'path';

describe('Configuration class', () => {
    const file_path = path.join(__dirname, './deviceInfo.test.yml');
    const config = Configuration.getInstance(file_path); // 更新为实际的路径

    it('should load deviceInfo', () => {
        const deviceInfo = config.deviceInfo;
        expect(deviceInfo).to.have.property('product').to.equal('AMIGO-ABCDE');
        expect(deviceInfo).to.have.property('device').to.equal('XYZ12');
    });

    it('should load fullDeviceInfo', () => {
        const fullDeviceInfo = config.fullDeviceInfo;
        expect(typeof fullDeviceInfo).to.be.equal('object');
        expect(fullDeviceInfo)
            .to.have.property('fingerprint')
            .to.equal('AMIGO/ABCDE/AMIGO:8.1.0/OPM1.171019.011/20190101:user/release-keys');
        expect(fullDeviceInfo).to.have.property('baseband').to.equal('M3.0.15');
    });
});
