import { Category } from "./category";

export interface UserData{
    monogram: string;
    profilePicture: string;
}

export interface UserProfileData{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    age: number;
    currentSalary: string;
    expectedSalary: string;
    county: string;
    zipcode: string;
    city: string;
    address: string;
    Profile: Profile;
    Categories: Category[];
}

export interface Profile{
    phone: string;
    profilePicture: string;
    cvPath: string;
    jobTitle: string;
    country: string;
    zipcode: string;
    city: string;
    address: string;
    expectedSalary: string;
    currentSalary: string;
    description: string;
}