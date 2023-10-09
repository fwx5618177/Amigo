import { randomBytes } from 'crypto';
import Utility from '../utils/Utility';
import { DeviceInfo, FullDeviceInfo } from './type';
import Configuration from './Configuration';
import path from 'path';

class DeviceInfoGenerator {
    private configuration: Configuration;

    constructor(file_path = path.join(__dirname, './deviceInfo.test.yml')) {
        this.configuration = Configuration.getInstance(file_path);
    }

    /**
     * 生成IMEI
     * IMEI是移动设备国际身份码的缩写
     * @returns 返回生成的IMEI
     */
    public generateIMEI(): string {
        const prefix = '86';
        const template = '0123456789';
        const numericString = Utility.randomString(12, template);
        // 随机生成12位数字字符串作为IMEI的主体部分
        const imeiWithoutCheckDigit = `${prefix}${numericString}`;
        const checkDigit = this.calculateCheckDigit(imeiWithoutCheckDigit);

        return `${imeiWithoutCheckDigit}${checkDigit}`;
    }

    /**
     * 计算IMEI的校验位
     * @param imeiWithoutCheckDigit 不包含校验位的 IMEI 号
     * @returns 返回IMEI的校验位
     */
    public calculateCheckDigit(imeiWithoutCheckDigit: string): number {
        let sum = 0;

        for (let i = 0; i < imeiWithoutCheckDigit.length; ++i) {
            let digit = parseInt(imeiWithoutCheckDigit[i]);

            if (i % 2 !== 0) {
                digit *= 2;
                if (digit > 9) {
                    digit = digit - 9; // equivalent to (digit % 10) + Math.floor(digit / 10);
                }
            }

            sum += digit;
        }

        return (10 - (sum % 10)) % 10;
    }

    /**
     * 生成简化版的设备信息
     * @remarks
     * 此方法从 YAML 配置文件中获取设备信息。如果配置文件中缺少某些信息，
     * 该方法将自动生成随机值来补全设备信息。这确保了无论配置文件的完整性如何，
     * 都能获得完整的设备信息。
     * @returns 返回包含简化设备信息的对象
     */
    public generateShortDevice(): DeviceInfo {
        const configDeviceInfo = this.configuration.deviceInfo;
        const randstr = this.randstr;

        const deviceInfo = {
            ...configDeviceInfo,
            product: `AMIGO-${randstr(5).toUpperCase()}`,
            device: randstr(5).toUpperCase(),
            board: randstr(5).toUpperCase(),
            brand: randstr(4).toUpperCase(),
            model: `AMIGO ${randstr(4).toUpperCase()}`,
            wifi_ssid: `HUAWEI-${randstr(7)}`,
            display: `IC.${randstr(7, true)}.${randstr(4, true)}`,
            boot_id: `${randstr(8)}-${randstr(4)}-${randstr(4)}-${randstr(4)}-${randstr(12)}`,
            proc_version: `Linux version 5.10.101-android10-${randstr(8)}`,
            ip_address: `192.168.${randstr(2, true)}.${randstr(2, true)}`,
            android_id: Utility.md5(this.generateIMEI()).toString('hex').substring(8, 24),
            incremental: randstr(10, true),
        };

        return deviceInfo;
    }

    /**
     * 生成随机字符串
     * @param length - 字符串的长度
     * @param numeric - 是否只包含数字
     * @returns 返回生成的随机字符串
     */
    public randstr(length: number, numeric: boolean = false): string {
        const chars = numeric ? '0123456789' : '0123456789abcdef';
        return Utility.randomString(length, chars);
    }

    /**
     * 生成完整的设备信息
     * @param shortDevice - 可选的简化版设备信息
     * @returns 返回包含完整设备信息的对象
     */
    public generateFullDevice(shortDevice?: DeviceInfo): FullDeviceInfo {
        const device = shortDevice || this.generateShortDevice();
        const configFullDeviceInfo = this.configuration.fullDeviceInfo;

        const fullDeviceInfo = {
            ...device,
            ...configFullDeviceInfo,
            fingerprint: `${device.brand}/${device.product}/${device.device}:10/${device.display}/${device.incremental}:user/release-keys`,
            wifi_bssid: device.mac_address,
            imei: device.android_id,
            version: {
                ...configFullDeviceInfo.version,
                incremental: device.incremental,
            },
            imsi: randomBytes(16),
            guid: Utility.md5(
                Buffer.concat([Buffer.from(device.android_id), Buffer.from(device.mac_address)]),
            ),
        };

        return fullDeviceInfo;
    }
}

export default DeviceInfoGenerator;
