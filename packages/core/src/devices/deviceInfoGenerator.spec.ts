import { expect } from 'chai';
import DeviceInfoGenerator from './DeviceInfoGenerator';
import path from 'path';

describe('DeviceInfoGenerator', () => {
    // 创建 DeviceInfoGenerator 实例
    const configPath = path.join(__dirname, './deviceInfo.test.yml');
    const deviceInfoGenerator = new DeviceInfoGenerator(configPath);

    describe('generateIMEI()', () => {
        it('should generate a valid IMEI number', () => {
            const imei = deviceInfoGenerator.generateIMEI();

            expect(imei).to.include('86').not.equal('861');
            // 断言 IMEI 是字符串并且有 15 位长度
            expect(imei).to.be.a('string').with.length(15);
            // 验证 IMEI 号的校验位是否正确
            const withoutCheckDigit = imei.substring(0, 14);
            const checkDigit = parseInt(imei[14], 10);
            expect(deviceInfoGenerator.calculateCheckDigit(withoutCheckDigit)).to.equal(checkDigit);
        });
    });

    describe('generateShortDevice()', () => {
        it('should generate a valid short device info object', () => {
            const shortDeviceInfo = deviceInfoGenerator.generateShortDevice();
            // 检查所有必要的属性是否都存在
            const properties = [
                'product',
                'device',
                'board',
                'brand',
                'model',
                'wifi_ssid',
                'bootloader',
                'display',
                'boot_id',
                'proc_version',
                'mac_address',
                'ip_address',
                'android_id',
                'incremental',
            ];
            properties.forEach(prop => {
                expect(shortDeviceInfo).to.have.property(prop).that.is.a('string');
            });

            expect(shortDeviceInfo.ip_address).to.match(/^192\.168\.\d{1,3}\.\d{1,3}$/); // IP地址格式验证
            expect(shortDeviceInfo.mac_address).to.equal('02:00:00:00:00:00'); // MAC地址验证

            // 这里只是一个例子，你应该根据实际情况添加更多的断言
            expect(shortDeviceInfo).to.have.property('product').that.is.a('string');
            expect(shortDeviceInfo).to.have.property('device').that.is.a('string');
            // ... 在这里添加更多的属性检查
        });
    });

    describe('generateFullDevice()', () => {
        it('should generate a valid full device info object', () => {
            const fullDeviceInfo = deviceInfoGenerator.generateFullDevice(null);

            // 检查所有扩展的属性是否都存在
            const extendedProperties = [
                'fingerprint',
                'baseband',
                'sim',
                'os_type',
                'wifi_bssid',
                'imei',
                'apn',
                'version',
                'imsi',
                'guid',
            ];
            extendedProperties.forEach(prop => {
                expect(fullDeviceInfo).to.have.property(prop);
            });

            // 检查版本信息是否符合预期的格式或范围
            expect(fullDeviceInfo.version).to.be.an('object');
            expect(fullDeviceInfo.version).to.have.property('incremental').that.is.a('string');
            expect(fullDeviceInfo.version).to.have.property('release').that.is.a('string');
            expect(fullDeviceInfo.version).to.have.property('codename').that.is.a('string');
            expect(fullDeviceInfo.version).to.have.property('sdk').that.is.a('number');
            expect(fullDeviceInfo.fingerprint).to.match(
                /^[\w.-]+\/[\w.-]+\/[\w.-]+:\d+\/[\w.-]+\/[\w.-]+:[\w.-]+\/[\w.-]+$/,
            );

            // 这里只是一个例子，你应该根据实际情况添加更多的断言
            expect(fullDeviceInfo).to.have.property('fingerprint').that.is.a('string');
            expect(fullDeviceInfo).to.have.property('wifi_bssid').that.is.a('string');

            // ... 在这里添加更多的属性检查
        });
    });
});
