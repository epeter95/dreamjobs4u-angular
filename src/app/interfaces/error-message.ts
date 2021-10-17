export interface ErrorMessage{
    id: number;
    key: string;
    adminName: string;
    createdAt: Date;
    updatedAt: Date;
    ErrorMessageTranslations: ErrorMessageTranslation[];
    selectedTranslation: ErrorMessageTranslation;
}

export interface ErrorMessageTranslation{
    id: number;
    languageId: number;
    errorMessageId: number;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}