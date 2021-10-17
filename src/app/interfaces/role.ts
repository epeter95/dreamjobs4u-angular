export interface Role{
    id: number;
    key: string;
    adminName: string;
    createdAt: Date;
    updatedAt: Date;
    isRoleSelected: boolean;
    RoleTranslations: RoleTranslation[];
    selectedTranslation: RoleTranslation;
}

export interface RoleTranslation{
    id: number;
    roleId: number;
    languageId: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}