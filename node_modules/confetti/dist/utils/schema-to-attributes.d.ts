import { z } from 'zod';
export interface AttributeOptions {
    includeRequired?: boolean;
    includeCreateFields?: boolean;
}
export interface BaseAttribute {
    key: string;
    label: string;
    description?: string;
    type: string;
}
export interface CreateAttribute extends BaseAttribute {
    required: boolean;
    placeholder?: string;
    helpText?: string;
    values?: string[];
}
export type Attribute = BaseAttribute | CreateAttribute;
export declare function schemaToAttributes(schema: z.ZodObject<z.ZodRawShape>, options?: AttributeOptions): Attribute[];
export declare function schemaToBaseAttributes(schema: z.ZodObject<z.ZodRawShape>): BaseAttribute[];
export declare function schemaToCreateAttributes(schema: z.ZodObject<z.ZodRawShape>): CreateAttribute[];
//# sourceMappingURL=schema-to-attributes.d.ts.map