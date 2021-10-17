export interface PublicContent{
    id: number;
    key: string;
    adminName: string;
    pagePlaceId: number;
    link: string;
    createdAt: Date;
    updatedAt: Date;
    PublicContentTranslations: PublicContentTranslation[];
    selectedTranslation: PublicContentTranslation;
}

export interface PublicContentTranslation{
    id: number;
    publicContentId: number;
    languageId: number;
    title: string;
}