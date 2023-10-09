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

/**
 * @interface TrackDeviceInfo
 *
 * @description
 * 此接口用于描述追踪设备的核心信息。包括设备的IMEI号和信息的最后修改时间。
 * IMEI号是设备的唯一标识，可以用于设备的追踪和管理。
 * 最后修改时间帮助确定设备信息的实时性，用于数据同步和更新。
 *
 * @extends
 * 此接口扩展自 FullDeviceInfo，继承了所有基础设备信息属性。
 *
 * @usage
 * 应在需要收集、存储或管理设备追踪信息的场景中使用此接口。
 * 其中的属性（如IMEI号和最后修改时间mtime）可选，便于适应不同类型和需求的设备。
 */
export interface TrackDeviceInfo {
    /**
     * @description
     * 存储设备的16位IMEI号。
     * IMEI (国际移动设备标识) 是移动设备的唯一标识号码。
     * 此属性可用于识别和追踪设备。
     * @optional
     * 该属性是可选的，因为并非所有设备都有IMEI号或需要提供IMEI号。
     */
    imei16?: string;

    /**
     * @description
     * 存储设备的36位IMEI号。
     * 此格式的IMEI可能包含更详细的设备信息，或用于特定的追踪和识别需求。
     * @optional
     * 该属性是可选的，某些设备可能没有36位的IMEI号或不需要提供。
     */
    imei36?: string;

    /**
     * @description
     * 表示设备信息的最后修改时间，是一个以毫秒为单位的时间戳。
     * 可用于确定设备信息的实时性，帮助进行数据同步、维护或其他相关操作。
     * @optional
     * 该属性是可选的，某些设备或场景可能不需要记录修改时间。
     */
    lastModifiedTime?: number;

    /**
     * @description
     * FullDeviceInfo 接口提供了关于设备的完整信息
     * @link FullDeviceInfo
     */
    deviceInfo: FullDeviceInfo;
}

// 定义接口来映射YAML文件的结构
export interface DeviceInfoConfig {
    deviceInfo: DeviceInfo;
    fullDeviceInfo: FullDeviceInfo;
}

/**
 * Apk 类型定义了登录设备的通用属性。这些属性提供了设备和相关应用的详细信息，
 * 用于识别、验证和处理特定的设备和应用程序实例。以下是每个属性的详细描述和用途。
 */
export type APK = {
    /**
     * 设备或应用程序的唯一标识符，通常用于识别和跟踪特定的设备或应用实例。
     */
    id: string;

    /**
     * 应用程序的密钥，用于验证和安全目的，确保只有经过授权的实体可以访问和操作应用程序。
     */
    app_key: string;

    /**
     * 应用程序的名称，提供了用户和开发者可以识别的可读名称。
     */
    name: string;

    /**
     * 应用程序的完整版本号，包括主版本、次版本和修订号等，用于识别和处理特定版本的应用程序。
     */
    version: string;

    /**
     * 应用程序的简短版本号，通常只包括主版本和次版本号，用于简洁地表示应用程序的版本。
     */
    ver: string;

    /**
     * 应用程序的签名，是一个 Buffer 对象，用于验证应用程序的完整性和真实性。
     */
    sign: Buffer;

    /**
     * 应用程序的构建时间戳，表示应用程序是何时构建和编译的，用于跟踪和管理应用程序的版本。
     */
    buildtime: number;

    /**
     * 应用程序的 ID，是一个数字，用于唯一标识和区分不同的应用程序。
     */
    appid: number;

    /**
     * 子 ID 可能用于进一步细分和标识应用程序的特定版本或变种。
     */
    subid: number;

    /**
     * 位图属性可能包含关于设备或应用程序的二进制或布尔类型的标志和设置。
     */
    bitmap: number;

    /**
     * 主签名映射可能包含关于应用程序主签名的信息或标识。
     */
    main_sig_map: number;

    /**
     * 子签名映射可能包含关于应用程序子签名的信息或标识。
     */
    sub_sig_map: number;

    /**
     * SDK 版本表示了应用程序使用的软件开发工具包的版本，用于开发、构建和测试应用程序。
     */
    sdkver: string;

    /**
     * 显示属性可能包含关于设备显示特性或应用程序界面的信息。
     */
    display: string;

    /**
     * 设备类型是一个数字，用于标识和区分不同类型的设备，
     * 特别是在支持多种类型设备的环境中（例如手机、平板电脑、智能手表等）。
     */
    device_type: number;

    /**
     * QUA 属性可能包含关于应用程序和设备的质量和性能的信息。
     */
    qua: string;

    /**
     * SSO 版本表示单点登录协议的版本，用于简化和统一不同应用程序和服务之间的用户身份验证和授权过程。
     */
    ssover: number;
};

/**
 * 支持的登录设备平台
 * * `aPad`和`Watch`协议无法设置在线状态、无法接收某些群事件（包括戳一戳等）
 * * 目前仅`Watch`支持扫码登录，可能会支持`iPad`扫码登录
 */
export enum Platform {
    /** 安卓手机 */
    Android = 1,
    /** 安卓平板 */
    aPad = 2,
    /** 安卓手表 */
    Watch = 3,
    /** MacOS */
    iMac = 4,
    /** iPad */
    iPad = 5,
    /** Tim */
    Tim = 6,
}

export const enum STATUS {
    /** 表示成功的状态码 */
    SUCCESS_CODE = 0,
    /** 表示失败的状态码 */
    ERROR_CODE = -1,
}

/**
 * Reserved 接口
 *
 * 这个接口定义了一系列的设备和环境相关的属性，这些属性可能被用于配置、识别或者其他需要
 * 根据设备和环境上下文动态变化的场景。这个接口在各种应用和服务中都有可能被用到，特别是
 * 那些需要根据设备和环境状态进行优化或者调整的场合。
 */
export interface Reserved {
    /**
     * 和设备兼容的 HarmonyOS 状态。
     * “0”表示不兼容，其他值表示兼容的等级或状态。
     */
    harmony: string;

    /**
     * 设备的克隆状态。
     * “1”表示是克隆或者仿制设备，”0”表示是原装设备。
     */
    clone: string;

    /**
     * 容器状态或类型。
     * 用于表示设备或应用是否运行在某种特定的容器或环境中。
     */
    containe: string;

    /**
     * oz 字段，具体含义和用途未知。
     * 可能与设备的某些特定特性或状态有关。
     */
    oz: string;

    /**
     * oo 字段，具体含义和用途未知。
     * 可能与设备的某些特定特性或状态有关。
     */
    oo: string;

    /**
     * kelong 字段表示设备是否经过改装或者定制。
     * “1”表示经过改装或定制，“0”表示原装状态。
     */
    kelong: string;

    /**
     * 设备的启动时间，通常以某种时间格式表示。
     * 可能被用于识别、分析或者调试设备的启动和运行状态。
     */
    uptimes: string;

    /**
     * 表示设备是否支持多用户模式。
     * “1”表示支持多用户模式，“0”表示不支持。
     */
    multiUser: string;

    /**
     * 设备的主板信息。
     * 可能包含主板的型号、版本或者其他相关信息。
     */
    bod: string;

    /**
     * 设备的品牌信息。
     * 用于识别设备的制造商或品牌。
     */
    brd: string;

    /**
     * 设备的型号或者代号。
     * 用于具体识别某一型号或者版本的设备。
     */
    dv: string;

    /**
     * 设备的一级分类或者类型信息。
     * 可能用于更广泛的分类和识别设备。
     */
    firstLevel: string;

    /**
     * 设备的制造商信息。
     * 用于识别和区分设备的制造商。
     */
    manufact: string;

    /**
     * 设备的具体名称或者标识。
     * 可能包含设备的型号、版本或者其他能够具体识别设备的信息。
     */
    name: string;

    /**
     * 主机或者服务器的地址或者标识。
     * 可能用于网络通信、数据交换等场景。
     */
    host: string;

    /**
     * 设备的内核信息。
     * 可能包含内核的版本、配置或者其他相关信息。
     */
    kernel: string;
}

/**
 * Payload 接口
 *
 * 用于定义与设备相关的信息和配置的数据结构。包含了设备的各种属性和配置参数，
 * 以便在应用程序中方便、统一地使用和管理这些数据。
 */
export interface Payload {
    /**
     * 设备的 Android ID。
     * Android ID 是 Android 设备在首次启动时生成的 64 位数字和字母的随机字符串。
     */
    androidId: string;

    /**
     * 平台 ID，用于表示设备的平台类型。
     * 通常用于区分不同的操作系统和设备类型。
     */
    platformId: number;

    /**
     * 应用程序的 appKey。
     * 用于标识、验证和管理特定的应用程序。
     */
    appKey: string;

    /**
     * 应用程序的版本号。
     * 用于识别和管理应用程序的不同版本。
     */
    appVersion: string;

    /**
     * beacon ID 的源数据。
     * 通常用于设备和服务的交互、识别和数据传输。
     */
    beaconIdSrc: string;

    /**
     * 设备的品牌名称。
     * 例如：Apple、Samsung、Huawei 等。
     */
    brand: string;

    /**
     * 渠道 ID。
     * 用于识别和统计应用程序的安装和使用情况的来源渠道。
     */
    channelId: string;

    /**
     * CID（内容 ID 或客户 ID）。
     * 用于识别和管理设备或用户的特定内容和数据。
     */
    cid: string;

    /**
     * 设备的 IMEI 号。
     * IMEI 是国际移动设备识别码的缩写，用于唯一识别移动电话的一个号码。
     */
    imei: string;

    /**
     * 设备的 IMSI 号的十六进制字符串表示形式。
     * IMSI 是国际移动用户识别码的缩写，用于唯一识别移动用户的一个号码。
     */
    imsi: string;

    /**
     * 设备的 MAC 地址。
     * MAC 地址是网络接口控制器的硬件地址，用于唯一识别网络设备。
     */
    mac: string;

    /**
     * 设备的型号名称。
     * 例如：iPhone 12、Galaxy S21 等。
     */
    model: string;

    /**
     * 设备的网络类型。
     * 用于表示设备当前连接的网络类型，例如：WiFi、4G、5G 等。
     */
    networkType: string;

    /**
     * 设备的 OAID。
     * OAID（Open Anonymous Device Identifier）是用于移动应用广告和统计的设备标识符。
     */
    oaid: string;

    /**
     * 设备的操作系统版本和级别。
     * 包括操作系统的名称、版本号和级别。
     */
    osVersion: string;

    /**
     * 设备的 QIMEI 号。
     * QIMEI 是一种用于标识移动设备的号码。
     */
    qimei: string;

    /**
     * 设备的 QIMEI 36 号。
     * 是 QIMEI 号的另一种表示形式。
     */
    qimei36: string;

    /**
     * SDK 的版本号。
     * 用于识别和管理应用程序使用的软件开发工具包的版本。
     */
    sdkVersion: string;

    /**
     * 目标 SDK 版本号。
     * 用于表示应用程序针对的 Android 平台版本。
     */
    targetSdkVersion: string;

    /**
     * 审计信息。
     * 可能包含设备和应用程序的使用和状态信息，用于审计和分析。
     */
    audit: string;

    /**
     * 用户 ID。
     * 用于唯一识别和管理用户的标识符。
     */
    userId: string;

    /**
     * 应用程序的包 ID。
     * 用于唯一识别 Android 平台上的应用程序。
     */
    packageId: string;

    /**
     * 设备的类型和显示信息。
     * 可能包含设备的型号、屏幕大小和分辨率等信息。
     */
    deviceType: string;

    /**
     * SDK 的名称。
     * 用于表示应用程序使用的软件开发工具包的名称。
     */
    sdkName: string;

    /**
     * 预留字段。
     * 可能包含额外的设备和应用程序的配置和状态信息。
     */
    reserved: Reserved;
}

/**
 * `ApkDictionary` 是一个用于映射不同平台到其对应 APK 信息的泛型类型别名。
 * 它利用 TypeScript 的映射类型，使得每一个 `Platform` 枚举值都能关联到一个具体的 APK 类型或 APK 类型的数组。
 *
 * 这样，不同平台（如 Android、iOS 等）可以有不同的 APK 信息结构，提供了极大的灵活性和扩展性。
 *
 * @template T 代表 APK 信息的类型，可以是一个具体的类型，也可以是接口或类型别名。
 *
 * @example
 * type AndroidApkInfo = { ... };
 * type iOSApkInfo = { ... };
 * const apkDictionary: ApkDictionary<AndroidApkInfo | iOSApkInfo> = { ... };
 */
export type ApkDictionary<T> = {
    [platform in Platform]: T | T[];
};

/**
 * `DeviceInfoDictionary` 是一个用于映射不同平台到其对应设备信息的泛型类型别名。
 */
export type DeviceManager = {
    secret: string;
    publicKey: string;
};
