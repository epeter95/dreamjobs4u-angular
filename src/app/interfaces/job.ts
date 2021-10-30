export interface Job{
    companyName: string;
    companyWebsite: string;
    jobLocation: string;
    logoUrl: string;
    categoryId: number;
    JobTranslations: JobTranslation[];
    selectedTranslation: JobTranslation;
}

export interface JobTranslation{
    id: number;
    jobId: number;
    languageId: number;
    title: string;
    aboutUs: string;
    jobDescription: string;
}