# Utility 类使用文档

## 概览

`Utility` 类是一个提供多种常用工具和辅助功能的工具类。它包括用于处理和格式化时间、哈希加密、数据流处理、字符串生成和对象属性操作的方法。每个方法都经过精心设计，旨在简化和优化常见任务的执行。

## 主要功能和方法

### 1. 时间处理

- `formatTime(value: Date | number | string, template: string): string`

  这个方法允许用户将不同格式的时间值转换为特定格式的字符串。支持的时间值类型包括 `Date` 对象、时间戳和可以被解析为时间的字符串。

### 2. 哈希加密

- `md5(data: BinaryLike): Buffer`

  提供 MD5 哈希加密，将输入的二进制数据或字符串加密成 MD5 格式的哈希值。

- `sha(data: BinaryLike): Buffer`

  类似于 MD5，但采用 SHA-1 算法进行哈希加密。

### 3. 数据流处理

- `unzip(data: Buffer): Promise<Buffer>`

  用于解压缩使用 gzip 算法压缩的数据。

- `gzip(data: Buffer): Promise<Buffer>`

  使用 gzip 算法压缩数据。

- `pipeline(...streams: stream.Stream[]): Promise<void>`

  使用管道方式处理多个数据流，将它们连接起来，数据从上游流到下游。

### 4. 字符串和数值生成

- `randomString(n: number, template: string): string`

  生成随机字符串，长度和字符集可定制。

- `timestamp(): number`

  获取当前的 UNIX 时间戳（以秒为单位）。

### 5. IP 地址转换

- `int32ip2str(ip: number | string): string`

  将整数格式的 IP 地址转换为字符串格式。

### 6. 对象属性操作

- `lock(obj: any, prop: string): void`

  隐藏并锁定对象的某个属性，使其不可配置、不可枚举和不可写。

- `unlock(obj: any, prop: string): void`

  解锁先前被锁定的对象属性，使其仍不可配置、不可枚举但可写。

- `hide(obj: any, prop: string): void`

  隐藏对象的某个属性，使其不可配置、不可枚举但可写。

## 使用示例

以下是 `Utility` 类中部分方法的使用示例。

### 格式化时间

```typescript
const formattedTime = Utility.formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss');
console.log(formattedTime); // 输出当前时间的格式化字符串
```

### MD5 加密

```typescript
const hash = Utility.md5('Hello World');
console.log(hash.toString('hex')); // 输出 "Hello World" 的 MD5 哈希值
```

### 数据流管道处理

```typescript
// 假设 source 是一个可读流，destination 是一个可写流
await Utility.pipeline(source, destination); // 将 source 的数据流传输到 destination
```

## 结论

`Utility` 类是一个功能丰富、用途广泛的工具类，旨在为开发者提供便捷的方法来处理常见但复杂的任务，帮助开发者提高开发效率，简化代码。通过熟悉和利用 `Utility` 类中的方法，开发者可以更高效地处理字符串、时间、哈希加密和数据流等相关任务。
