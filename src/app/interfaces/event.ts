import { Job } from "./job";
import { UserProfileData } from "./user-data";

export interface VideoEvent{
    id: number;
    jobId: number;
    Job: Job;
    ownerId: number;
    link: string;
    Users: UserProfileData[];
    startDate: Date;
    createdAt: Date;
    updatedAt: Date;
}