import { Category } from "./category";
import { UserProfileData } from "./user-data";

export interface Job{
    id: number;
    companyName: string;
    companyWebsite: string;
    jobLocation: string;
    logoUrl: string;
    categoryId: number;
    User: UserProfileData;
    JobTranslations: JobTranslation[];
    selectedTranslation: JobTranslation;
    Category: Category;
}

export interface JobTranslation{
    id: number;
    jobId: number;
    languageId: number;
    title: string;
    aboutUs: string;
    jobDescription: string;
}