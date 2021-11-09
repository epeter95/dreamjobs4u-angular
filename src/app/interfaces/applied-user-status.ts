export interface AppliedUserStatus{
    id: number;
    key: string;
    adminName: string;
    AppliedUserStatusTranslations: AppliedUserStatusTranslation[];
    selectedTranslation: AppliedUserStatusTranslation;
    createdAt: Date;
    updatedAt: Date;
}

export interface AppliedUserStatusTranslation{
    id: number;
    languageId: number;
    appliedUserStatusId: number;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}