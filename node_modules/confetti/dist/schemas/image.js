import { z } from 'zod';
export const ImageSchema = z.object({
    id: z.number().describe(JSON.stringify({
        label: 'ID',
        description: 'Identifier of the image.',
    })),
    type: z.string().describe(JSON.stringify({
        label: 'Type',
    })),
    order: z.string().describe(JSON.stringify({
        label: 'Order',
    })),
    original: z.string().describe(JSON.stringify({
        label: 'Original',
    })),
    url30: z.string().describe(JSON.stringify({
        label: 'Url30',
    })),
    url50: z.string().describe(JSON.stringify({
        label: 'Url50',
    })),
    url75: z.string().describe(JSON.stringify({
        label: 'Url75',
    })),
    url100: z.string().describe(JSON.stringify({
        label: 'Url100',
    })),
    url300: z.string().describe(JSON.stringify({
        label: 'Url300',
    })),
    url500: z.string().describe(JSON.stringify({
        label: 'Url500',
    })),
    url500x500: z.string().describe(JSON.stringify({
        label: 'Url500x500',
    })),
    url1000: z.string().describe(JSON.stringify({
        label: 'Url1000',
    })),
    url2000: z.string().describe(JSON.stringify({
        label: 'Url2000',
    })),
    urlMax2000: z.string().describe(JSON.stringify({
        label: 'UrlMax2000',
    })),
    title: z.string().describe(JSON.stringify({
        label: 'Title',
    })),
    description: z.string().describe(JSON.stringify({
        label: 'Description',
    })),
    link: z.string().describe(JSON.stringify({
        label: 'Link',
    })),
});
