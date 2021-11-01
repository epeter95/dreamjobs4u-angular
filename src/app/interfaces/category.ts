import { Job } from "./job";

export interface Category{
    id: number;
    key: string;
    adminName: string;
    CategoryTranslations: CategoryTranslation[];
    Jobs: Job[];
    jobCount: string;
    selectedTranslation: CategoryTranslation;
}

export interface CategoryTranslation{
    id: number;
    categoryId: number;
    languageId: number;
    text: string;
}