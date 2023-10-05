/**
 * 这些常量用于标识 JCE 编码数据的不同部分和类型。
 * 在解析 JCE 数据时，代码会读取每个元素的类型和标签，并根据这些信息来正确地解析和处理数据。
 */
export const enum JCE_DATA_TYPE {
    /** 8位整型 */
    INT8 = 0,

    /** 16位整型 */
    INT16 = 1,

    /** 32位整型 */
    INT32 = 2,

    /** 64位整型 */
    INT64 = 3,

    /** 单精度浮点数 */
    FLOAT = 4,

    /** 双精度浮点数 */
    DOUBLE = 5,

    /** 长度小于256的字符串 */
    SHORT_STRING = 6,

    /** 长度大于等于256的字符串 */
    LONG_STRING = 7,

    /** 映射类型，例如字典或哈希表 */
    MAP = 8,

    /** 列表类型，例如数组 */
    LIST = 9,

    /** 结构体开始标志 */
    STRUCT_BEGIN = 10,

    /** 结构体结束标志 */
    STRUCT_END = 11,

    /** 零值，用于优化编码空间 */
    ZERO = 12,

    /** 简单列表，其中每个元素都是相同类型 */
    SIMPLE_LIST = 13,
}

/**
 * 这些常量用于标识 JCE 编码数据的不同部分和类型。
 * 在解析 JCE 数据时，代码会读取每个元素的类型和标签，并根据这些信息来正确地解析和处理数据。
 */
export const enum JCE_DATA_TAG {
    /** 在映射中表示键的标签 */
    MAP_KEY = 0,

    /** 在映射中表示值的标签 */
    MAP_VALUE = 1,

    /** 在列表中表示元素的标签 */
    LIST_ELEMENT = 0,

    /** 在简单列表中表示字节的标签 */
    BYTES = 0,

    /** 表示长度的标签，在列表、映射和简单列表中使用 */
    LENGTH = 0,

    /** 表示结构体结束的标签 */
    STRUCT_END = 0,
}

/**
 * 这些常量用于标识 JCE 编码数据的不同部分和类型。
 */
export const JCE_FLAG_STRUCT = {
    /** 结构结束标志，用于内部标识结构的结束 */
    FLAG_STRUCT_END: Symbol('FLAG_STRUCT_END'),
};

export const enum JCE_BIT_MASK {
    /** 用于处理读取字节的基础单位 */
    READ_BIT_BYTE = 1,
    /** 用于处理移动的基础单位 */
    MOVE_BIT = 4,
    /** 用于处理与操作 */
    LOW_BIT_AND = 0x0f,
    /** 用于处理右移操作 */
    HIGH_BIT_AND = 0xf0,
    /** 当数据标签为 0xf 时，从下一个字节中读取扩展的标签值 ｜ 新增：表示标签为 15 (0xf) 的情况 */
    EXTENDED = 0xf,
}
