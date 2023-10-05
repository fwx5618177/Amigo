import chalk from 'chalk';

/**
 * Log 类用于处理和在控制台中以彩色输出显示各种类型的日志。
 * 它提供了装饰器，以便在调用某些方法时自动记录信息、警告和错误。
 *
 * @example
 * class Example {
 *    @Log.logInfo
 *    someMethod() { // 执行某些操作 }
 *
 *    @Log.logError
 *    someErrorProneMethod() { // 执行可能会抛出错误的操作 }
 * }
 *
 * Log.info("这是一条信息日志");
 * Log.warn("这是一条警告日志");
 */
export class Log {
    /**
     * 装饰器，用于以彩色输出记录错误。
     * 每次装饰的方法抛出错误时，都会记录错误。
     *
     * @param args - 装饰器参数: target, propertyName, descriptor
     * @param {any} target - 类的原型（忽略它）。
     * @param {string} propertyName - 被装饰的方法的名称（用于记录日志）。
     * @param {PropertyDescriptor} descriptor - 被装饰的方法的描述符。
     * @param target - 类的原型（忽略它）。
     * @param propertyName - 被装饰的方法的名称（用于记录日志）。
     * @param descriptor - 被装饰的方法的描述符。
     *
     * @example
     * @Log.logError
     * someMethod() { throw new Error('发生了一个错误'); }
     */
    static logError(...args: any[]) {
        const target = args[0];
        const propertyName = args[1];
        const descriptor = args[2];

        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            try {
                // 调用原始方法，如果没有错误，正常返回结果
                return originalMethod.apply(this, args);
            } catch (error: any) {
                // 捕获错误，记录错误信息，并将错误重新抛出
                const stackLines = error.stack?.split('\n');
                const location = stackLines ? stackLines[1].trim() : 'unknown location';

                console.log(
                    chalk.red('[Error]'),
                    chalk.blue(`(${location}):`),
                    chalk.yellow(error.message),
                );

                throw error; // 重新抛出错误，或者您可以根据需要处理错误
            }
        };

        return descriptor;
    }

    /**
     * 装饰器，用于每次调用装饰的方法时以彩色输出记录信息。
     *
     * @param args - 装饰器参数: target, propertyName, descriptor
     * @param {any} target - 类的原型（忽略它）。
     * @param {string} propertyName - 被装饰的方法的名称（用于记录日志）。
     * @param {PropertyDescriptor} descriptor - 被装饰的方法的描述符。
     * @param target - 类的原型（忽略它）。
     * @param propertyName - 被装饰的方法的名称（用于记录日志）。
     * @param descriptor - 被装饰的方法的描述符。
     *
     * @example
     * @Log.logInfo
     * someMethod() { // 执行某些操作 }
     */
    static logInfo(...args: any[]) {
        const target = args[0];
        const propertyName = args[1];
        const descriptor = args[2];
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const result = originalMethod.apply(this, args);
            console.log(
                chalk.blue('[Info]'),
                `Method ${propertyName} called with`,
                chalk.green(args.join(', ')),
            );
            return result;
        };

        return descriptor;
    }

    /**
     * 装饰器，用于每次调用装饰的方法时以彩色输出记录警告。
     *
     * @param args - 装饰器参数: target, propertyName, descriptor
     * @param {any} target - 类的原型（忽略它）。
     * @param {string} propertyName - 被装饰的方法的名称（用于记录日志）。
     * @param {PropertyDescriptor} descriptor - 被装饰的方法的描述符。
     * @param target - 类的原型（忽略它）。
     * @param propertyName - 被装饰的方法的名称（用于记录日志）。
     * @param descriptor - 被装饰的方法的描述符。
     *
     * @example
     * @Log.logWarn
     * someMethod() { // 执行可能会引发警告的操作 }
     */
    static logWarn(...args: any[]) {
        const target = args[0];
        const propertyName = args[1];
        const descriptor = args[2];

        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const result = originalMethod.apply(this, args);
            console.log(
                chalk.yellow('[Warning]'),
                `Method ${propertyName} called with`,
                chalk.magenta(args.join(', ')),
            );
            return result;
        };

        return descriptor;
    }

    /**
     * 用于记录错误的类装饰器。每当使用了该装饰器的类被实例化时，都会记录错误信息。
     *
     * @param target - 被装饰的类。
     *
     * @example
     * @Log.logErrorClass
     * class MyErrorClass { // ... }
     */
    static logErrorClass(...args: any[]) {
        // 保存原始定义
        const original: Function = args[0];

        // 新构造函数的行为
        const f: any = function (...args: any[]) {
            let instance;

            try {
                // 尝试实例化原始类
                instance = Reflect.construct(original, args, new.target);

                // 记录位置和地址
                const location = Log.getCallerLocation();
                const params = JSON.stringify(args);

                // 在实例上附加位置和参数信息
                instance.location = location;
                instance.params = params;

                console.log(
                    chalk.red('[Error Class]'),
                    chalk.blue(`(${location}):`),
                    chalk.yellow(params),
                );
            } catch (error: any) {
                // 捕获构造函数中的错误，并在控制台中以彩色输出显示错误信息
                const stackLines = error.stack?.split('\n');
                const location = stackLines ? stackLines[1].trim() : '未知位置';

                console.log(
                    chalk.red('[错误]'),
                    chalk.blue(`(${location}):`),
                    chalk.yellow(error.message),
                );

                throw error; // 重新抛出错误
            }

            return instance;
        };

        // 复制原型，使 instanceof 操作符仍然可用
        f.prototype = original.prototype;

        // 返回新构造函数（将替换原始构造函数）
        return f;
    }

    /**
     * 用于记录信息的类装饰器。每当使用了该装饰器的类被实例化时，都会记录信息。
     *
     * @param target - 被装饰的类。
     *
     * @example
     * @Log.logInfoClass
     * class MyInfoClass { // ... }
     */
    static logInfoClass(...args: any[]) {
        // 保存原始定义
        const original: Function = args[0];

        const f: any = function (...args: any[]) {
            console.log(chalk.blue('[Info]'), 'New: ' + original.name);

            const instance = Reflect.construct(original, args, new.target);

            // 添加其他信息记录逻辑

            return instance;
        };

        f.prototype = original.prototype;
        return f;
    }

    /**
     * 用于记录警告的类装饰器。每当使用了该装饰器的类被实例化时，都会记录警告。
     *
     * @param target - 被装饰的类。
     *
     * @example
     * @Log.logWarnClass
     * class MyWarningClass { // ... }
     */
    static logWarnClass(...args: any[]) {
        // 保存原始定义
        const original: Function = args[0];

        const f: any = function (...args: any[]) {
            console.log(chalk.yellow('[Warning]'), 'New: ' + original.name);

            const instance = Reflect.construct(original, args, new.target);

            // 添加其他警告记录逻辑

            return instance;
        };

        f.prototype = original.prototype;
        return f;
    }

    /**
     * 以彩色输出将信息消息记录到控制台。
     *
     * @param message - 要记录的消息。
     *
     * @example
     * Log.info("这是一条信息消息");
     */

    static info(...args: any[]) {
        const message = args.join(' ');
        console.log(chalk.blue('[Info]'), message);
    }

    /**
     * 以彩色输出将警告消息记录到控制台。
     *
     * @param message - 要记录的消息。
     *
     * @example
     * Log.warn("这是一条警告消息");
     */
    static warn(...args: any[]) {
        const message = args.join(' ');
        console.log(chalk.yellow('[Warning]'), message);
    }

    /**
     * 以彩色输出将错误消息记录到控制台。
     * 这个方法不会抛出错误，它只是记录错误。
     * 如果您想要记录并抛出错误，请使用 @logError 装饰器。
     * @param message - 要记录的消息。
     * @example
     * Log.error("这是一条错误消息");
     * @example
     * Log.error("这是一条错误消息", error);
     */
    static error(...args: any[]) {
        const message = args.join(' ');
        console.log(chalk.red('[Error]'), message);
    }

    /**
     * 获取调用堆栈中的调用位置。
     *
     * @description
     * 使用 Error.captureStackTrace 来捕获当前代码执行的调用堆栈信息，然后通过分析堆栈信息来获取调用位置
     *
     * @description
     * 1. 堆栈的第一行通常是错误信息的描述，而不是代码位置。
     * 2. 堆栈的第二行通常是 Error.captureStackTrace 函数的调用，它不包含应用代码的信息。
     * 3. 堆栈的第三行通常是装饰器函数的调用，我们希望捕获这个位置。
     * 4. 如果堆栈中至少有四行，我们假定第四行包含装饰器函数的调用位置，并返回它。如果堆栈行数少于四行，我们返回一个默认的 "未知位置"。
     * @returns 调用位置。
     */
    static getCallerLocation() {
        const error = {} as any;
        Error.captureStackTrace(error, Log.getCallerLocation);

        const stackLines = error.stack.split('\n');

        // 假定调用位置在堆栈的第三行
        if (stackLines.length >= 4) {
            return stackLines[3].trim();
        } else {
            return '未知位置';
        }
    }
}

export default Log;
