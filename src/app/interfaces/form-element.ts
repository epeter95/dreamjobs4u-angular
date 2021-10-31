export interface FormElement{
    key: string;
    placeholder: string;
    imgUrl?:string;
    focus: boolean;
    type?: string;
    value?: any;
    fieldType?: string;
    profileDataKey?:string;
    widthClass?: string;
    center?: boolean;
    roleName?: string;
    hide?: boolean;
}