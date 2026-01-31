export interface Attribute {
    key: string;
    [key: string]: unknown;
}
export default function (attributes: Attribute[], additionalConfig?: Record<string, unknown>): Attribute[];
//# sourceMappingURL=transform-attributes.d.ts.map