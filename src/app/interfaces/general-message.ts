export interface GeneralMessage{
    id: number;
    key: string;
    adminName: string;
    createdAt: Date;
    updatedAt: Date;
    GeneralMessageTranslations: GeneralMessageTranslation[];
    selectedTranslation: GeneralMessageTranslation;
}

export interface GeneralMessageTranslation{
    id: number;
    languageId: number;
    generalMessageId: number;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}