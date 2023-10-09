import { APK, Platform, ApkDictionary } from './type';

// 类型声明与常量定义
export interface APKShortInfo {
    name: string;
    version: string;
    ver: string;
    buildtime: number;
    subid: number;
    bitmap: number;
    sdkver: string;
    qua: string;
    ssover: number;
}

// 这个常量包含了 APK 的固定信息
const APK_FIXED_INFO = {
    id: 'com.tencent.mobileqq',
    appid: 16,
    app_key: '0S200MNJT807V3GE',
    sign: Buffer.from(
        'A6 B7 45 BF 24 A2 C2 77 52 77 16 F6 F3 6E B6 8D'.split(' ').map(s => parseInt(s, 16)),
    ),
    main_sig_map: 16724722,
    sub_sig_map: 0x10400,
    display: 'Android',
    device_type: 3,
};

// 这个数组包含了各个版本的 APK 的独特信息
const APK_VERSIONS: APKShortInfo[] = [
    {
        name: 'A8.9.83.c9a61e5e',
        version: '8.9.83.12605',
        ver: '8.9.83',
        buildtime: 1691565978,
        subid: 537178646,
        bitmap: 150470524,
        sdkver: '6.0.0.2554',
        qua: 'V1_AND_SQ_8.9.83_4680_YYB_D',
        ssover: 20,
    },
    {
        name: 'A8.9.80.57a42f50',
        version: '8.9.80.12440',
        ver: '8.9.80',
        buildtime: 1691565978,
        subid: 537176863,
        bitmap: 150470524,
        sdkver: '6.0.0.2554',
        qua: 'V1_AND_SQ_8.9.80_4614_YYB_D',
        ssover: 20,
    },
    {
        name: 'A8.9.78.d5d9d71d',
        version: '8.9.78.12275',
        ver: '8.9.78',
        buildtime: 1691565978,
        subid: 537175315,
        bitmap: 150470524,
        sdkver: '6.0.0.2554',
        qua: 'V1_AND_SQ_8.9.78_4548_YYB_D',
        ssover: 20,
    },
    {
        name: 'A8.9.76.c71a1fa8',
        version: '8.9.76.12115',
        ver: '8.9.76',
        buildtime: 1691565978,
        subid: 537173477,
        bitmap: 150470524,
        sdkver: '6.0.0.2554',
        qua: 'V1_AND_SQ_8.9.76_4484_YYB_D',
        ssover: 20,
    },
    {
        name: 'A8.9.75.354d41fc',
        version: '8.9.75.12110',
        ver: '8.9.75',
        buildtime: 1691565978,
        subid: 537173381,
        bitmap: 150470524,
        sdkver: '6.0.0.2554',
        qua: 'V1_AND_SQ_8.9.75_4482_YYB_D',
        ssover: 20,
    },
    {
        name: 'A8.9.73.11945',
        version: '8.9.73.11945',
        ver: '8.9.73',
        buildtime: 1690371091,
        subid: 537171689,
        bitmap: 150470524,
        sdkver: '6.0.0.2553',
        qua: 'V1_AND_SQ_8.9.73_4416_YYB_D',
        ssover: 20,
    },
    {
        name: 'A8.9.71.9fd08ae5',
        version: '8.9.71.11735',
        ver: '8.9.71',
        buildtime: 1688720082,
        subid: 537170024,
        bitmap: 150470524,
        sdkver: '6.0.0.2551',
        qua: 'V1_AND_SQ_8.9.71_4332_YYB_D',
        ssover: 20,
    },
    {
        name: 'A8.9.70.b4332bd3',
        version: '8.9.70.11730',
        ver: '8.9.70',
        buildtime: 1688720082,
        subid: 537169928,
        bitmap: 150470524,
        sdkver: '6.0.0.2551',
        qua: 'V1_AND_SQ_8.9.70_4330_YYB_D',
        ssover: 20,
    },
    {
        name: 'A8.9.68.e757227e',
        version: '8.9.68.11565',
        ver: '8.9.68',
        buildtime: 1687254022,
        subid: 537168313,
        bitmap: 150470524,
        sdkver: '6.0.0.2549',
        qua: 'V1_AND_SQ_8.9.68_4264_YYB_D',
        ssover: 20,
    },
    {
        name: 'A8.9.63.5156de84',
        version: '8.9.63.11390',
        ver: '8.9.63',
        buildtime: 1685069178,
        subid: 537164840,
        bitmap: 150470524,
        sdkver: '6.0.0.2546',
        qua: 'V1_AND_SQ_8.9.63_4194_YYB_D',
        ssover: 20,
    },
];

/**
 * @name MOBILE_VERSION_LIST_INFO
 * @description
 * * 通过合并每个版本的独特信息和固定信息，生成完整的 APK 信息数组。
 * * 这种方式使得当需要添加、移除或修改版本信息时，只需在 APK_VERSIONS 数组中进行操作，
 * * 无需更改其他代码，从而提高了代码的可维护性。
 */
export const MOBILE_VERSION_LIST_INFO: APK[] = APK_VERSIONS.map(versionInfo => ({
    ...APK_FIXED_INFO,
    ...versionInfo,
}));

/**
 * @name A_PAD_VERSION_LIST_INFO
 * 这个数组包含了 aPad 版本的 APK 的独特信息
 * @remarks
 * aPad 版本的 APK 与普通版本的 APK 的区别在于 subid 属性的值不同。
 * 因此，我们只需在普通版本的 APK 的基础上修改 subid 属性的值即可。
 *
 */
const A_PAD_SUB_IDS: {
    ver: string;
    subid: number;
}[] = [
    {
        ver: '8.9.83',
        subid: 537178685,
    },
    {
        ver: '8.9.80',
        subid: 537176902,
    },
    {
        ver: '8.9.78',
        subid: 537175354,
    },
    {
        ver: '8.9.76',
        subid: 537173525,
    },
    {
        ver: '8.9.75',
        subid: 537173429,
    },
    {
        ver: '8.9.73',
        subid: 537171737,
    },
    {
        ver: '8.9.71',
        subid: 537170072,
    },
    {
        ver: '8.9.70',
        subid: 537169976,
    },
    {
        ver: '8.9.68',
        subid: 537168361,
    },
    {
        ver: '8.9.63',
        subid: 537164888,
    },
];

/**
 * @name A_PAD_VERSION_LIST_INFO
 *
 * @description
 * * 通过合并每个版本的独特信息和固定信息，生成完整的 aPad 信息数组。
 * * 这种方式使得当需要添加、移除或修改版本信息时，只需在 A_PAD_SUB_IDS 数组中进行操作，
 */
export const A_PAD_VERSION_LIST_INFO: APK[] = MOBILE_VERSION_LIST_INFO.map(version => ({
    ...version,
    display: 'aPad',
    subid: A_PAD_SUB_IDS.find(s => s.ver === version.ver)!.subid,
}));

/**
 * @name TIM_FIXED_INFO
 * 这个常量包含了 TIM 的固定信息
 */

const TIM_FIXED_INFO = {
    id: 'com.tencent.tim',
    app_key: '0S200MNJT807V3GE',
    sign: Buffer.from('775e696d09856872fdd8ab4f3f06b1e0', 'hex'),
    appid: 16,
    main_sig_map: 16724722,
    sub_sig_map: 0x10400,
    display: 'Tim',
    device_type: -1,
};

/**
 * @name TIM_VERSONS
 * 这个数组包含了各个版本的 TIM 的独特信息
 */
const TIM_VERSONS = [
    // 每个版本不同的信息
    {
        name: 'A3.5.5.fa2ef27c',
        version: '3.5.5.3198',
        ver: '3.5.5',
        buildtime: 1630062176,
        subid: 537177451,
        bitmap: 150470524,
        sdkver: '6.0.0.2484',
        qua: 'V1_AND_SQ_8.3.9_355_TIM_D',
        ssover: 18,
    },
    {
        name: 'A3.5.2.3f4af297',
        version: '3.5.2.3178',
        ver: '3.5.2',
        buildtime: 1630062176,
        subid: 537162286,
        bitmap: 150470524,
        sdkver: '6.0.0.2484',
        qua: 'V1_AND_SQ_8.3.9_352_TIM_D',
        ssover: 18,
    },
    {
        name: 'A3.5.1.db08e878',
        version: '3.5.1.3168',
        ver: '3.5.1',
        buildtime: 1630062176,
        subid: 537150355,
        bitmap: 150470524,
        sdkver: '6.0.0.2484',
        qua: 'V1_AND_SQ_8.3.9_351_TIM_D',
        ssover: 18,
    },
];

/**
 * @name TIM_VERSION_LIST_INFO
 * @description
 * * 通过合并每个版本的独特信息和固定信息，生成完整的 TIM 信息数组。
 * * 这种方式使得当需要添加、移除或修改版本信息时，只需在 TIM_VERSONs 数组中进行操作，
 */
export const TIM_VERSION_LIST_INFO: APK[] = TIM_VERSONS.map(versionInfo => ({
    ...TIM_FIXED_INFO,
    ...versionInfo,
}));

/**
 * @name WATCH_FIXED_INFO
 * 这个常量包含了 Watch 的固定信息
 */
const WATCH_FIXED_VERSION = {
    id: 'com.tencent.qqlite',
    app_key: '0S200MNJT807V3GE',
    sign: Buffer.from(
        'A6 B7 45 BF 24 A2 C2 77 52 77 16 F6 F3 6E B6 8D'.split(' ').map(s => parseInt(s, 16)),
    ),
    appid: 16,
    main_sig_map: 16724722,
    sub_sig_map: 0x10400,
    display: 'Watch',
    device_type: 8,
};

/**
 * @name WATCH_VERSION
 * 这个数组包含了各个版本的 Watch 的独特信息
 */
const WATCH_VERSION = [
    {
        name: 'A2.0.8',
        version: '2.0.8',
        ver: '2.0.8',
        buildtime: 1559564731,
        subid: 537065138,
        bitmap: 16252796,
        sdkver: '6.0.0.2365',
        qua: '',
        ssover: 5,
    },
    {
        name: 'A2.1.7',
        version: '2.1.7',
        ver: '2.1.7',
        buildtime: 1654570540,
        subid: 537140974,
        bitmap: 16252796,
        sdkver: '6.0.0.2366',
        qua: 'V1_WAT_SQ_2.1.7_002_IDC_B',
        ssover: 5,
    },
];

/**
 * @name WATCH_VERSION_LIST_INFO
 * @description
 * * 通过合并每个版本的独特信息和固定信息，生成完整的 Watch 信息数组。
 * * 这种方式使得当需要添加、移除或修改版本信息时，只需在 WATCH_VERSIONs 数组中进行操作，
 */
export const WATCH_VERSION_LIST_INFO: APK[] = WATCH_VERSION.map(version => ({
    ...WATCH_FIXED_VERSION,
    ...version,
}));

/**
 * @name HD_FIXED_INFO
 * 这个常量包含了 HD 的固定信息
 * @remarks
 * HD 版本的 APK 与普通版本的 APK 的区别在于 subid 属性的值不同。
 * 因此，我们只需在普通版本的 APK 的基础上修改 subid 属性的值即可。
 */
export const HD_FIXED_INFO: APK = {
    id: 'com.tencent.qq',
    app_key: '0S200MNJT807V3GE',
    name: 'A6.8.2.21241',
    version: '6.8.2.21241',
    ver: '6.8.2',
    // 使用 Buffer.from 和 map 函数一起创建 Buffer 实例
    sign: Buffer.from(
        'AA 39 78 F4 1F D9 6F F9 91 4A 66 9E 18 64 74 C7'.split(' ').map(s => parseInt(s, 16)),
    ),
    buildtime: 1647227495,
    appid: 16,
    subid: 537128930,
    bitmap: 150470524,
    main_sig_map: 1970400,
    sub_sig_map: 66560,
    sdkver: '6.2.0.1023',
    display: 'iMac',
    device_type: 5,
    qua: '',
    ssover: 12,
};

/**
 * @name I_PAD_FIXED_INFO
 * 这个常量包含了 IPad 的固定信息
 */
export const I_PAD_FIXED_INFO: APK = {
    ...MOBILE_VERSION_LIST_INFO[0],
    subid: 537155074,
    sign: HD_FIXED_INFO.sign,
    name: '8.9.50.611',
    version: '8.9.50.611',
    ver: '8.9.50',
    sdkver: '6.0.0.2535',
    qua: '',
    display: 'iPad',
    ssover: 19,
};

/**
 * @name APK_INFO_LIST
 * @description
 * * 这个字典包含了所有 APK 的信息。
 * * 通过这个字典，我们可以通过平台名称来获取对应的 APK 信息。
 * * 这种方式使得当需要添加、移除或修改 APK 信息时，只需在对应的常量中进行操作，
 */
export const APK_INFO_LIST: ApkDictionary<APK> = {
    [Platform.Android]: MOBILE_VERSION_LIST_INFO,
    [Platform.Tim]: TIM_VERSION_LIST_INFO,
    [Platform.aPad]: A_PAD_VERSION_LIST_INFO,
    [Platform.Watch]: WATCH_VERSION_LIST_INFO,
    [Platform.iMac]: HD_FIXED_INFO,
    [Platform.iPad]: I_PAD_FIXED_INFO,
};
