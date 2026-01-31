/**
 * Utility function to load raw and formatted samples for a given model
 * @param modelName - The name of the model (e.g., 'category', 'contact')
 * @returns Object containing single and multiple sample data, or default empty structure if no samples exist
 */
export default function loadSamples(modelName: string): {
    single: {
        formatted: {
            id: string;
            type: string;
            blockType: string;
            status: string;
            order: number;
            content: {
                html: string;
                showSocial: boolean;
                showRsvpButton: boolean;
            };
        } | {
            id: number;
            name: string;
            type: string;
            createdAt: string;
            updatedAt: string;
            organisationId: number;
        } | {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            token: string;
            status: string;
            comment: string;
            lastSeen: string;
            createdAt: string;
            updatedAt: string;
            organisationId: number;
            company: string;
            type: string;
            meta: {
                webhookType: string;
            };
        } | {
            name: string;
            startDate: string;
            endDate: string;
            timeZone: string;
            slug: string;
            status: string;
            featureLevel: string;
            signupType: string;
            website: string;
            email: string;
            rsvpLimit: number;
            rsvpLeft: number;
            waitlisted: number;
            hasPassed: boolean;
            createdAt: string;
            updatedAt: string;
            summary: string;
            timeFormat: string;
            locale: string;
            primaryColor: string;
            contrastColor: string;
            waitlist: boolean;
            location: {
                url: string;
            };
            id: string;
            type: string;
            images: null;
            meta: {
                webhookType: string;
            };
        } | {
            id: number;
            name: string;
            type: string;
        } | {
            name: string;
            email: string;
            company: string;
            amount: number;
            vat: number;
            vatPercentage: number;
            token: string;
            currency: string;
            status: string;
            paidAt: string;
            commission: string;
            commissionVat: string;
            customer: {
                other: string;
            };
            id: string;
            type: string;
            meta: {
                webhookType: string;
            };
        } | {
            id: string;
            type: string;
            name: string;
            slug: null;
            order: number;
            settings: {
                index: boolean;
                access: string;
                menuDisplay: string;
            };
        } | {
            persons: number;
            hashid: string;
            description: string;
            price: number;
            currency: string;
            name: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            token: string;
            status: string;
            emailStatus: string;
            checkinAt: null;
            waitlistAt: null;
            startDate: string;
            endDate: null;
            values: {
                'field-one-field': string;
                'field-what-do-you-think': string[];
            };
            comment: null;
            company: string;
            guests: number;
            termsAcceptedAt: string;
            deletionRequestedAt: null;
            createdAt: string;
            updatedAt: string;
            ticketBatchId: number;
            paymentId: number;
            eventId: number;
            contactId: number;
            id: string;
            type: string;
            meta: {
                webhookType: string;
            };
        } | {
            type: string;
            url: string;
            provider: string;
            status: string;
            createdAt: string;
            updatedAt: string;
            id: string;
        } | {
            id: number;
            name: string;
            type: string;
        } | {
            left: number;
            status: string;
            id: number;
            name: string;
            order: number;
            description: null;
            promoCode: null;
            releasedAt: null;
            closedAt: null;
            price: string;
            useCustomVat: boolean;
            vatPercentage: null;
            limit: number;
            sold: number;
            reserved: number;
            settings: {};
            startDate: null;
            endDate: null;
            createdAt: string;
            updatedAt: string;
            eventId: number;
            linkedTicketBatchId: null;
            formId: null;
            payoutId: null;
            type: string;
        };
        raw: {
            data: {
                id: string;
                type: string;
                attributes: {
                    blockType: string;
                    type: string;
                    status: string;
                    order: number;
                    content: {
                        html: string;
                        showSocial: boolean;
                        showRsvpButton: boolean;
                    };
                };
                relationships: {
                    images: {
                        data: null;
                    };
                };
            };
        } | {
            data: {
                id: number;
                type: string;
                attributes: {
                    name: string;
                    createdAt: string;
                    updatedAt: string;
                    organisationId: number;
                };
            };
        } | {
            data: {
                id: string;
                type: string;
                attributes: {
                    firstName: string;
                    lastName: string;
                    email: string;
                    phone: string;
                    token: string;
                    status: string;
                    comment: string;
                    lastSeen: string;
                    createdAt: string;
                    updatedAt: string;
                    organisationId: number;
                    company: string;
                };
            };
            meta: {
                webhookType: string;
            };
        } | {
            data: {
                id: string;
                type: string;
                attributes: {
                    name: string;
                    startDate: string;
                    endDate: string;
                    timeZone: string;
                    slug: string;
                    status: string;
                    featureLevel: string;
                    signupType: string;
                    website: string;
                    email: string;
                    rsvpLimit: number;
                    rsvpLeft: number;
                    waitlisted: number;
                    hasPassed: boolean;
                    createdAt: string;
                    updatedAt: string;
                    summary: string;
                    timeFormat: string;
                    locale: string;
                    primaryColor: string;
                    contrastColor: string;
                    waitlist: boolean;
                    location: {
                        url: string;
                    };
                };
                relationships: {
                    images: {
                        data: null;
                    };
                };
            };
            meta: {
                webhookType: string;
            };
        } | {
            data: {
                id: number;
                type: string;
                attributes: {
                    name: string;
                };
            };
        } | {
            data: {
                id: string;
                type: string;
                attributes: {
                    name: string;
                    email: string;
                    company: string;
                    amount: number;
                    vat: number;
                    vatPercentage: number;
                    token: string;
                    currency: string;
                    status: string;
                    paidAt: string;
                    commission: string;
                    commissionVat: string;
                    customer: {
                        other: string;
                    };
                };
            };
            meta: {
                webhookType: string;
            };
        } | {
            data: {
                id: string;
                type: string;
                attributes: {
                    name: string;
                    slug: null;
                    order: number;
                    settings: {
                        index: boolean;
                        access: string;
                        menuDisplay: string;
                    };
                };
                relationships: {
                    blocks: {
                        data: {
                            id: string;
                            type: string;
                        }[];
                    };
                };
            };
        } | {
            data: {
                id: string;
                type: string;
                attributes: {
                    persons: number;
                    hashid: string;
                    description: string;
                    price: number;
                    currency: string;
                    name: string;
                    firstName: string;
                    lastName: string;
                    email: string;
                    phone: string;
                    token: string;
                    status: string;
                    emailStatus: string;
                    checkinAt: null;
                    waitlistAt: null;
                    startDate: string;
                    endDate: null;
                    values: {
                        'field-one-field': string;
                        'field-what-do-you-think': string[];
                    };
                    comment: null;
                    company: string;
                    guests: number;
                    termsAcceptedAt: string;
                    deletionRequestedAt: null;
                    createdAt: string;
                    updatedAt: string;
                    ticketBatchId: number;
                    paymentId: number;
                    eventId: number;
                    contactId: number;
                };
            };
            meta: {
                webhookType: string;
            };
        } | {
            data: {
                id: string;
                type: string;
                attributes: {
                    type: string;
                    url: string;
                    provider: string;
                    status: string;
                    createdAt: string;
                    updatedAt: string;
                };
            };
        } | {
            data: {
                id: number;
                type: string;
                attributes: {
                    name: string;
                };
            };
        } | {
            data: {
                id: number;
                type: string;
                attributes: {
                    left: number;
                    status: string;
                    name: string;
                    order: number;
                    description: null;
                    promoCode: null;
                    releasedAt: null;
                    closedAt: null;
                    price: string;
                    useCustomVat: boolean;
                    vatPercentage: null;
                    limit: number;
                    sold: number;
                    reserved: number;
                    settings: {};
                    startDate: null;
                    endDate: null;
                    createdAt: string;
                    updatedAt: string;
                    eventId: number;
                    linkedTicketBatchId: null;
                    formId: null;
                    payoutId: null;
                };
            };
        };
    };
    multiple: {
        formatted: any[];
        raw: {
            data: ({
                id: string;
                type: string;
                attributes: {
                    blockType: string;
                    type: string;
                    status: string;
                    order: number;
                    content: {
                        html: string;
                        showSocial: boolean;
                        showRsvpButton: boolean;
                    };
                };
                relationships: {
                    images: {
                        data: null;
                    };
                };
            } | {
                id: string;
                type: string;
                attributes: {
                    firstName: string;
                    lastName: string;
                    email: string;
                    phone: string;
                    token: string;
                    status: string;
                    comment: string;
                    lastSeen: string;
                    createdAt: string;
                    updatedAt: string;
                    organisationId: number;
                    company: string;
                };
            } | {
                id: string;
                type: string;
                attributes: {
                    name: string;
                    startDate: string;
                    endDate: string;
                    timeZone: string;
                    slug: string;
                    status: string;
                    featureLevel: string;
                    signupType: string;
                    website: string;
                    email: string;
                    rsvpLimit: number;
                    rsvpLeft: number;
                    waitlisted: number;
                    hasPassed: boolean;
                    createdAt: string;
                    updatedAt: string;
                    summary: string;
                    timeFormat: string;
                    locale: string;
                    primaryColor: string;
                    contrastColor: string;
                    waitlist: boolean;
                    location: {
                        url: string;
                    };
                };
                relationships: {
                    images: {
                        data: null;
                    };
                };
            } | {
                id: number;
                type: string;
                attributes: {
                    name: string;
                };
            } | {
                id: string;
                type: string;
                attributes: {
                    name: string;
                    email: string;
                    company: string;
                    amount: number;
                    vat: number;
                    vatPercentage: number;
                    token: string;
                    currency: string;
                    status: string;
                    paidAt: string;
                    commission: string;
                    commissionVat: string;
                    customer: {
                        other: string;
                    };
                };
            } | {
                id: string;
                type: string;
                attributes: {
                    name: string;
                    slug: null;
                    order: number;
                    settings: {
                        index: boolean;
                        access: string;
                        menuDisplay: string;
                    };
                };
                relationships: {
                    blocks: {
                        data: {
                            id: string;
                            type: string;
                        }[];
                    };
                };
            } | {
                id: string;
                type: string;
                attributes: {
                    persons: number;
                    hashid: string;
                    description: string;
                    price: number;
                    currency: string;
                    name: string;
                    firstName: string;
                    lastName: string;
                    email: string;
                    phone: string;
                    token: string;
                    status: string;
                    emailStatus: string;
                    checkinAt: null;
                    waitlistAt: null;
                    startDate: string;
                    endDate: null;
                    values: {
                        'field-one-field': string;
                        'field-what-do-you-think': string[];
                    };
                    comment: null;
                    company: string;
                    guests: number;
                    termsAcceptedAt: string;
                    deletionRequestedAt: null;
                    createdAt: string;
                    updatedAt: string;
                    ticketBatchId: number;
                    paymentId: number;
                    eventId: number;
                    contactId: number;
                };
            } | {
                id: string;
                type: string;
                attributes: {
                    type: string;
                    url: string;
                    provider: string;
                    status: string;
                    createdAt: string;
                    updatedAt: string;
                };
            })[];
        };
    };
};
//# sourceMappingURL=load-samples.d.ts.map