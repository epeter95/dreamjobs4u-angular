export interface Language{
    id: number;
    key: string;
    adminName: string;
    active: boolean;
    createdAt: Date;
    flagUrl: string;
    updatedAt: Date;
    LanguageTranslations: LanguageTranslation[];
    selectedTranslation: LanguageTranslation;
}

export interface LanguageTranslation{
    id: number;
    languageId: number;
    languageElementId: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}