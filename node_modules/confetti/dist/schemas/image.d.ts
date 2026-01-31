import { z } from 'zod';
export declare const ImageSchema: z.ZodObject<{
    id: z.ZodNumber;
    type: z.ZodString;
    order: z.ZodString;
    original: z.ZodString;
    url30: z.ZodString;
    url50: z.ZodString;
    url75: z.ZodString;
    url100: z.ZodString;
    url300: z.ZodString;
    url500: z.ZodString;
    url500x500: z.ZodString;
    url1000: z.ZodString;
    url2000: z.ZodString;
    urlMax2000: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    link: z.ZodString;
}, z.core.$strip>;
export type Image = z.infer<typeof ImageSchema>;
//# sourceMappingURL=image.d.ts.map