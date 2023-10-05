/**
 * JCE Struct
 * @description
 * A JCE Struct is a plain object with numeric keys.
 * The keys are the tags of the JCE fields.
 * The values are the values of the JCE fields.
 * @example
 * { 1: 'foo', 2: 'bar' }
 */
export type JCEStruct = { [tag: number]: any };
