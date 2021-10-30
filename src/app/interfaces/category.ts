export interface Category{
    id: number;
    key: string;
    adminName: string;
    CategoryTranslations: CategoryTranslation[];
    selectedTranslation: CategoryTranslation;
}

export interface CategoryTranslation{
    id: number;
    categoryId: number;
    languageId: number;
    text: string;
}