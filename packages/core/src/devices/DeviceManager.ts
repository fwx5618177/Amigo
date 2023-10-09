import axios from 'axios';
import EncryptionAlgorithm from '../encryption-algorithm/EncryptionAlgorithm';
import Utility from '../utils/Utility';
import DeviceInfoGenerator from './DeviceInfoGenerator';
import {
    TrackDeviceInfo,
    FullDeviceInfo,
    STATUS,
    Payload,
    Reserved,
    Platform,
    ApkDictionary,
    APK,
} from './type';
import { APK_INFO_LIST } from './ApkInfoList';
import Configuration from './Configuration';

/**
 * DeviceManager 类
 *
 * 这个类用于管理和处理与设备相关的信息和操作。它包含了设备的私有和公共信息，
 * 提供了获取 QIMEI（Qualcomm International Mobile Equipment Identity）的方法，
 * 并能生成与设备相关的随机 payload。该类也包含一个构造函数，用于初始化设备的
 * 软件和硬件信息。
 *
 * @property {string} secret - 存储设备的私有密钥
 * @property {string} publicKey - 存储设备的公共密钥
 * @property {Apk} apk - 存储设备软件的信息
 * @property {ShortDevice} deviceInfo - 存储设备硬件的信息（可选）
 *
 * @method constructor - 构造函数，用于初始化设备的软件和硬件信息
 * @method getQIMEI - 异步方法，用于获取设备的 QIMEI 信息
 * @method genRandomPayloadByDevice - 生成与设备相关的随机 payload
 * @method getConfigurations - 生成与设备相关的配置信息
 * @method postRequest - 发送 POST 请求到指定的服务器
 */
class DeviceManager implements TrackDeviceInfo {
    private configuration: Configuration;
    /** 私有变量deviceInfoGenerator用于生成设备信息 */
    private deviceInfoGenerator: DeviceInfoGenerator;
    /** 私有变量secret用于存储密钥，它在加密和API通信过程中起到了核心作用 */
    private secret: string;
    /** 存储设备的公钥信息，用于数据加密和身份验证 */
    private publicKey: string;
    /** 存储设备的IMEI号，用于设备的追踪和管理 */
    public imei16?: string;
    /** 存储设备的36位IMEI号，用于特定的追踪和识别需求 */
    public imei36?: string;
    /** 存储设备信息的最后修改时间，用于数据同步和更新 */
    public lastModifiedTime?: number;
    /** 存储设备的软件信息 */
    public deviceInfo: FullDeviceInfo;
    /** 存储设备的硬件信息 */
    public apk: APK;
    /** 设备平台类型 */
    public platform: Platform;
    /** 所有 APK 的信息的字典  */
    public apkList: ApkDictionary<APK> = APK_INFO_LIST;

    /**
     * 构造函数
     * @param platform - 设备平台类型
     * @param deviceInfo - 一个可选的对象，包含了设备的硬件信息
     * @param deviceInfoYmlPath - 一个可选的字符串，表示设备信息的YAML文件路径
     */
    constructor(platform: Platform, deviceInfo?: FullDeviceInfo, deviceInfoYmlPath?: string) {
        this.deviceInfoGenerator = new DeviceInfoGenerator(deviceInfoYmlPath);

        this.platform = platform;
        this.apk = this.getApkInfo(platform);
        this.deviceInfo = deviceInfo ?? this.deviceInfoGenerator.generateFullDevice();
        this.configuration = Configuration.getInstance(deviceInfoYmlPath);

        this.publicKey = this.configuration.deviceManager.publicKey;
        this.secret = this.configuration.deviceManager.secret;
    }

    /**
     * 获取配置信息
     *
     * 此函数用于生成和获取与设备相关的配置信息，如加密密钥、时间戳、nonce 和负载。
     * @returns 配置信息对象，包含加密密钥、时间戳、nonce 和加密后的参数。
     */
    public getConfigurations() {
        // 生成随机字符串用于加密
        const randomKey = Utility.randomString(16);

        // 使用 PKCS1 加密公钥和随机字符串生成加密键
        const encryptedKey = EncryptionAlgorithm.PKCS1Encrypt(this.publicKey, randomKey);

        // 获取当前的时间戳
        const timestamp = Date.now();

        // 生成一个随机字符串作为 nonce
        const nonceValue = Utility.randomString(16);

        // 获取随机负载通过设备信息
        const devicePayload = this.genRandomPayloadByDevice();

        // 使用 AES 加密技术加密负载并转为 base64 格式
        const encryptedParams = EncryptionAlgorithm.aesEncrypt(
            JSON.stringify(devicePayload),
            randomKey,
        ).toString('base64');

        /**
         * 使用 md5 算法生成签名
         * - `encryptedKey` 是用 PKCS1 加密算法加密的密钥
         * - `encryptedParams` 是用 AES 加密算法加密的请求参数，已转换为 base64 格式
         * - `timestamp` 是当前的 UNIX 时间戳
         * - `nonceValue` 是生成的随机字符串，用于增加请求的安全性
         * - `this.secret` 是在此类或实例中定义的密钥或密码
         *
         * 将这些值连接成一个字符串，并使用 md5 算法计算得到的哈希值，然后将哈希值转换为十六进制字符串格式，
         * 作为请求的签名（sign）。这样做是为了确保请求的完整性和安全性。
         */
        const sign = Utility.md5(
            encryptedKey + encryptedParams + timestamp + nonceValue + this.secret,
        ).toString('hex');

        return { encryptedKey, timestamp, nonceValue, encryptedParams, randomKey, sign };
    }

    /**
     * 发送 POST 请求到指定的服务器。
     * @param {Object} config - 加密配置。
     * @returns {Object} 返回服务器响应的数据。
     */
    public async postRequest(config: ReturnType<typeof this.getConfigurations>) {
        const params = {
            key: config.encryptedKey,
            params: config.encryptedParams,
            time: config.timestamp,
            nonce: config.nonceValue,
            sign: config.sign,
            extra: '',
        };
        const headers = {
            'User-Agent': `Dalvik/2.1.0 (Linux; U; Android ${this.deviceInfo.version.release}; PCRT00 Build/N2G48H)`,
            'Content-Type': 'application/json',
        };

        try {
            const response = await axios.post<{ data: string; code: number }>(
                'https://snowflake.qq.com/ola/android',
                params,
                { headers },
            );

            return response;
        } catch (error) {
            console.error('Error occurred while sending POST request:', error);
        }
    }

    /**
     * 异步获取 QIMEI 函数
     * QIMEI 是一个设备的唯一标识符，该函数使用 AES 和 PKCS1 加密技术从远程服务器获取 QIMEI。
     */
    public async getQIMEI(): Promise<{
        imei16?: string;
        imei36?: string;
        deviceInfo: FullDeviceInfo;
    }> {
        // 检查 APK app_key 是否为空，如果为空，则不执行任何操作并直接返回
        if (this.apk.app_key === '') {
            return;
        }

        try {
            const config = this.getConfigurations();

            const { data } = await this.postRequest(config);

            // 检查返回的数据的 code 是否不等于 0，如果是，则不执行任何操作并直接返回
            if (data?.code !== STATUS.SUCCESS_CODE) {
                return;
            }

            // 使用 AES 解密返回的数据，并从中解构 q16 和 q36 的值
            const { q16, q36 } = JSON.parse(
                EncryptionAlgorithm.aesDecrypt(data.data, config.randomKey),
            );

            // 设置 imei16 和 imei36 的属性值
            this.imei16 = q16;
            this.imei36 = q36 || q16;

            // 如果 qImei36 存在，则使用其值生成一个新的 imsi 缓冲区
            if (this.imei36) this.deviceInfo.imsi = Buffer.from(this.imei36, 'hex');

            return {
                imei16: this.imei16,
                imei36: this.imei36,
                deviceInfo: this.deviceInfo,
            };
        } catch (error) {
            // 记录错误日志或抛出异常
            console.error('Error occurred while getting QIMEI:', error);
        }
    }

    /**
     * 生成一个位于 min 和 max 之间的随机整数
     * @param max - 最大值
     * @param min - 最小值
     * @returns 返回在 min 和 max 之间的随机整数
     */
    public fixedRand(max = 1, min = 0): number {
        if (max < min) [max, min] = [min, max];
        const diff = max - min;
        return Math.floor(Math.random() * diff) + min;
    }

    /**
     * 格式化时间为指定格式的字符串
     * @param time 要格式化的时间，默认为当前时间
     * @param fmt 时间的格式，默认为 'YYYY-mm-ddHHMMSS'
     * @returns 格式化后的时间字符串
     */
    public dateFormat(fmt?: string, time: number | Date = Date.now()): string {
        return Utility.formatDateTime(time, fmt); // 假设 formatTime 是一个已经定义好的时间格式化函数
    }

    /**
     * 生成 mtime 字符串
     * @param mtime 时间戳
     * @param imeiPart imei 的部分字符串
     * @returns 生成的 mtime 字符串
     */
    public generateMtimeStr(mtime: Date, imeiPart: string) {
        return `${this.dateFormat('YYYY-mm-ddHHMMSS', mtime)}.${imeiPart}`;
    }

    /**
     * 生成 reserved 负载部分
     * @returns reserved 对象，包含各种设备和其他信息
     */
    public generateReservedPayload(): Reserved {
        return {
            harmony: '0',
            clone: Math.random() > 0.5 ? '1' : '0',
            containe: '',
            oz: '',
            oo: '',
            kelong: Math.random() > 0.5 ? '1' : '0',
            uptimes: Utility.formatDateTime(new Date()), // formatTime 需要由外部提供，这里没有实现
            multiUser: Math.random() > 0.5 ? '1' : '0',
            bod: this.deviceInfo.board,
            brd: this.deviceInfo.brand,
            dv: this.deviceInfo.device,
            firstLevel: '',
            manufact: this.deviceInfo.brand,
            name: this.deviceInfo.model,
            host: 'se.infra',
            kernel: this.deviceInfo.fingerprint,
        };
    }

    /**
     * 生成 mtime1 和 mtime2 字符串
     * mtime1 是当前时间的字符串，mtime2 是当前时间减去随机数的字符串
     * @param lastModifiedTime 最后修改时间
     * @param imei 设备的 IMEI 号
     * @returns 生成的 mtime1 和 mtime2 字符串
     */
    public generateMtimestr(lastModifiedTime: number, imei: string) {
        const mtime1 = new Date(lastModifiedTime);
        const mtimeStr1 = this.generateMtimeStr(mtime1, imei.slice(2, 11));
        const mtime2 = new Date(lastModifiedTime - parseInt(imei.slice(2, 4)));
        const mtimeStr2 = this.generateMtimeStr(mtime2, imei.slice(5, 14));

        return { mtimeStr1, mtimeStr2 };
    }

    /**
     * 基于 IMEI 生成特定格式的 ID
     * @returns 返回基于 IMEI 的 ID 数组
     */
    public generateImeiBasedIds(): string[] {
        const imeiPart = parseInt(this.deviceInfo.imei.slice(5, 7));
        return Array.from(
            { length: 2 },
            (_, index) =>
                `${Utility.formatDateTime('YYYY-mm-ddHHMMSS')}.${String(
                    (10 + imeiPart + index) % 100,
                ).padStart(2, '0')}0000000`,
        );
    }

    /**
     * 生成 beaconId 的函数
     * @param timestamp 当前时间戳
     * @returns 返回格式化后的 beaconId 字符串
     */
    public generateBeaconId(timestamp: number): string {
        return `${Utility.formatDateTime(new Date(timestamp + this.fixedRand(60, 0)))}.${String(
            this.fixedRand(99, 0),
        ).padStart(2, '0')}0000000`;
    }

    /**
     * 生成 beaconIdArr 负载部分
     * * beaconIdArr 是一个包含时间戳和其他信息的数组
     * * 时间戳是一个字符串，格式为 'YYYY-mm-ddHHMMSS.0000000'
     * * 其他信息是一个字符串，格式为 'k1:xxxxx;k2:xxxxx;...;kN:xxxxx'
     * * 其中 k1 到 kN 是一个数字，代表了数组中元素的索引
     * * xxxxx 是一个字符串，代表了数组中元素的值
     * @remarks
     * 这里我们使用了一个固定的随机数，它是设备 IMEI 的一部分
     * @returns beaconIdArr 数组，包含时间戳和其他信息
     */
    public generateBeaconIdArr() {
        const timestamp = Date.now();
        this.lastModifiedTime = this.lastModifiedTime || Date.now();
        const { mtimeStr1, mtimeStr2 } = this.generateMtimestr(
            this.lastModifiedTime,
            this.deviceInfo.imei,
        );

        // 使用 generateBeaconId 函数来减少代码重复
        const beaconIds = Array.from({ length: 8 }, () => this.generateBeaconId(timestamp));
        const randomNumbers = Array.from({ length: 4 }, () => this.fixedRand(10000000, 1000000));

        return [
            beaconIds[0],
            mtimeStr1,
            '0000000000000000',
            Utility.md5(this.deviceInfo.android_id + this.deviceInfo.imei)
                .toString('hex')
                .slice(0, 16),
            ...randomNumbers,
            this.deviceInfo.boot_id,
            '1',
            this.fixedRand(5, 0),
            this.fixedRand(5, 0),
            ...beaconIds.slice(1, 3),
            this.fixedRand(5, 0),
            this.fixedRand(100, 10),
            ...beaconIds.slice(3, 5),
            this.fixedRand(50000, 10000),
            this.fixedRand(100, 10),
            ...beaconIds.slice(5, 7),
            mtimeStr2,
            this.fixedRand(10000, 1000),
            this.fixedRand(5, 0),
            ...this.generateImeiBasedIds(),
            this.fixedRand(10000, 1000),
            this.fixedRand(100, 10),
            ...this.generateImeiBasedIds(),
            this.fixedRand(10000, 1000),
            this.fixedRand(5, 0),
            ...beaconIds.slice(7, 8),
            this.fixedRand(5, 0),
            this.fixedRand(100, 10),
            ...beaconIds.slice(7, 8),
            this.fixedRand(5, 0),
            this.fixedRand(5, 0),
        ];
    }

    /**
     * 生成随机负载，基于设备信息和其他随机或固定参数
     * @returns 生成的随机负载
     */
    public genRandomPayloadByDevice(): Payload {
        // 这里我们分离出 reserved 和 beaconIdArr 的生成，使主函数更简洁

        const reserved = this.generateReservedPayload();
        const beaconIdArr = this.generateBeaconIdArr();
        const beaconIdSrc = beaconIdArr.map((str, idx) => `k${idx + 1}:${str}`).join(';');

        return {
            androidId: this.deviceInfo.android_id,
            platformId: 1,
            appKey: this.apk.app_key,
            appVersion: this.apk.version,
            beaconIdSrc,
            brand: this.deviceInfo.brand,
            channelId: '2017',
            cid: '',
            imei: this.deviceInfo.imei,
            imsi: this.deviceInfo.imsi.toString('hex'),
            mac: this.deviceInfo.mac_address,
            model: this.deviceInfo.model,
            networkType: 'unknown',
            oaid: '',
            osVersion: `Android ${this.deviceInfo.version.release},level ${this.deviceInfo.version.sdk}`,
            qimei: '',
            qimei36: '',
            sdkVersion: '1.2.13.6',
            targetSdkVersion: '26',
            audit: '',
            userId: '{}',
            packageId: this.apk.id,
            deviceType: this.deviceInfo.display,
            sdkName: '',
            reserved: reserved,
        };
    }

    /**
     * 获取 APK 信息
     *
     * 根据指定的平台和版本，从 apklist 中获取对应的 APK 信息。如果没有提供版本信息，
     * 将返回该平台下的第一个 APK 信息。如果平台下有多个 APK，将返回匹配版本的 APK，
     * 或者第一个 APK（如果没有提供版本或找不到匹配的版本）。
     *
     * * 获取指定平台和版本的Apk信息
     * @param apkList
     * @param platform - 设备平台类型
     * @param version - 可选的版本号
     * @returns 返回匹配的Apk信息对象
     */
    public getApkInfo(platform: Platform, version?: string): APK {
        const apks = this.apkList[platform];
        if (Array.isArray(apks)) return apks.find(a => a.ver === version) || apks[0];
        return apks;
    }

    /**
     * 获取 APK 信息列表
     *
     * 根据指定的平台，从 apklist 中获取该平台下的所有 APK 信息。如果该平台下只有一个
     * APK，将返回一个包含这个 APK 的数组。
     *
     * @param platform - 设备平台类型
     * @returns 返回一个包含所有匹配Apk信息的数组
     */
    public getApkInfoList(platform: Platform): APK[] {
        const apks = this.apkList[platform];
        if (!Array.isArray(apks)) return [apks];
        return apks;
    }
}

export default DeviceManager;
