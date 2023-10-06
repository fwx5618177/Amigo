/**
 * DeviceInfo 接口定义了一个设备的基本信息。
 * 它包含了关于设备的各种属性，例如品牌、型号、显示、处理器版本等。
 */
export interface DeviceInfo {
    /** 用于标识 YAML 文件的开始 */
    '--begin--': string;
    /** 设备的产品名，通常是品牌和型号的组合 */
    product: string;

    /** 设备的名字或者标识符 */
    device: string;

    /** 设备的主板信息 */
    board: string;

    /** 设备的品牌名 */
    brand: string;

    /** 设备的型号 */
    model: string;

    /** 连接的 Wi-Fi 的 SSID */
    wifi_ssid: string;

    /** 设备的引导加载程序信息 */
    bootloader: string;

    /** 设备的显示信息，通常包含了固件或者软件的版本 */
    display: string;

    /** 设备的启动 ID，通常是一个 UUID */
    boot_id: string;

    /** 设备的处理器版本信息 */
    proc_version: string;

    /** 设备的 MAC 地址 */
    mac_address: string;

    /** 设备的 IP 地址 */
    ip_address: string;

    /** 设备的 Android ID */
    android_id: string;

    /** 设备的增量版本信息 */
    incremental: string;

    /** 用于标识 YAML 文件的结束 */
    '--end--': string;
}

/**
 * FullDeviceInfo 接口提供了关于设备的完整信息。
 * 它扩展了 DeviceInfo 接口，添加了更多的属性，例如指纹、基带、SIM 卡信息等。
 */
export interface FullDeviceInfo extends DeviceInfo {
    /** 设备的指纹信息，通常用于安全和验证目的 */
    fingerprint: string;

    /** 设备的基带信息 */
    baseband: string;

    /** 设备中的 SIM 卡提供商信息 */
    sim: string;

    /** 设备的操作系统类型 */
    os_type: string;

    /** 设备连接的 Wi-Fi 的 BSSID */
    wifi_bssid: string;

    /** 设备的 IMEI 号 */
    imei: string;

    /** 设备的接入点名称 (APN) */
    apn: string;

    /** 设备的版本信息，包括增量版本、发布版本、代号和 SDK 版本 */
    version: {
        incremental: string;
        release: string;
        codename: string;
        sdk: number;
    };

    /** 设备的 IMSI 号，通常用于移动网络的识别和验证 */
    imsi: Buffer;

    /** 设备的全局唯一标识符 (GUID) */
    guid: Buffer;
}

// 定义接口来映射YAML文件的结构
export interface DeviceInfoConfig {
    deviceInfo: DeviceInfo;
    fullDeviceInfo: FullDeviceInfo;
}
