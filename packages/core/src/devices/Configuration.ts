import yaml from 'js-yaml';
import fs from 'fs';
import { DeviceInfo, FullDeviceInfo } from './type'; // 路径根据实际情况调整

/**
 * Configuration 类用于加载和管理设备配置信息。
 * 它是一个单例类，确保整个应用程序中配置数据的一致性和只读性。
 */
class Configuration {
    // 单例实例
    private static instance: Configuration;
    // 配置文件的路径
    private configPath: string;
    // 存储设备信息和完整设备信息的对象
    private configData: {
        deviceInfo: DeviceInfo;
        fullDeviceInfo: FullDeviceInfo;
    };

    /**
     * 私有构造函数，防止外部实例化，确保单例。
     * @param configPath - 配置文件的路径
     */
    private constructor(configPath: string) {
        this.configPath = configPath;
        this.loadConfig();
    }

    /**
     * 加载配置文件。配置文件使用 YAML 格式。
     * 该方法在实例化时自动调用，确保 configData 总是有值。
     */
    private loadConfig(): void {
        try {
            const fileContents = fs.readFileSync(this.configPath, 'utf8');
            this.configData = yaml.load(fileContents, { json: true }) as {
                deviceInfo: DeviceInfo;
                fullDeviceInfo: FullDeviceInfo;
            };
        } catch (error) {
            console.error('Error loading configuration file:', error);
            throw error;
        }
    }

    /**
     * 获取 Configuration 的单例实例。
     * @param configPath - 配置文件的路径
     * @returns 返回 Configuration 的单例实例。
     */
    public static getInstance(configPath: string): Configuration {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration(configPath);
        }

        return Configuration.instance;
    }

    /**
     * 获取设备信息。
     * @returns 返回设备信息对象。
     */
    public get deviceInfo(): DeviceInfo {
        return this.configData.deviceInfo;
    }

    /**
     * 获取完整的设备信息。
     * @returns 返回完整的设备信息对象。
     */
    public get fullDeviceInfo(): FullDeviceInfo {
        return this.configData.fullDeviceInfo;
    }
}

export default Configuration;
