/**
 * @description
 * `Struct`类继承自`null`，意味着这个类没有默认的原型链，不包含任何继承的属性或方法。
 * 这个类主要用于创建一个清洁的、没有任何继承属性或方法的对象。
 * 在处理数据或配置的时候，这种做法可能会带来好处，因为它能够减少意外的属性或方法干扰处理逻辑。
 *
 * @example
 * const struct = new Struct();
 *
 * @summary
 * `struct` 不会有通常情况下一个对象所拥有的原型链属性和方法
 */
class Struct extends null {}

export default Struct;
