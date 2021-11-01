import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { Category } from 'src/app/interfaces/category';
import { DropdownData } from 'src/app/interfaces/dropdown';
import { FormElement } from 'src/app/interfaces/form-element';
import { Job } from 'src/app/interfaces/job';
import { Language } from 'src/app/interfaces/language';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-job-handle',
  templateUrl: './job-handle.component.html',
  styleUrls: ['./job-handle.component.scss']
})
export class JobHandleComponent implements OnInit, OnDestroy {
  sendButtonText: string = '';
  createJobTitleText: string = '';
  modifyJobTitleText: string = '';
  successfulSaveJobText: string = '';
  requiredFieldErrorText: string = '';
  isUserClicked: boolean = false;
  hunSubtitleText: string = '';
  enSubtitleText: string = '';
  hunLanguage!: Language;
  enLanguage!: Language;
  languages: Language[] = new Array();
  languageSubscription: Subscription = new Subscription();
  jobLanguageKey: string = 'hu';
  queriedJobId: string = '';
  successfulModifyJobText: string = '';
  choosePictureButtonText: string = '';
  getJobDataButtonText: string = '';

  jobFormElements: FormElement[] = [
    { key: 'jobCompanyName', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobCompanyLogo', placeholder: '', focus: false, fieldType: 'file' },
    { key: 'jobCompanyWebsite', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobLocation', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobCategoryId', placeholder: '', focus: false, fieldType: 'dropdown', center: true },
  ];

  jobFormDetailElements: FormElement[] = [
    { key: 'jobTitle', placeholder: '', focus: false, fieldType: 'input', widthClass: 'form-field-full-width' },
    { key: 'jobAboutUs', placeholder: '', focus: false, fieldType: 'textarea' },
    { key: 'jobDescription', placeholder: '', focus: false, fieldType: 'textarea' },
    { key: 'jobPayment', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobType', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobExperience', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobQualification', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobLanguage', placeholder: '', focus: false, fieldType: 'input' }
  ];

  jobForm: FormGroup = new FormGroup({
    jobCompanyName: new FormControl('', Validators.required),
    jobCompanyLogo: new FormControl('', Validators.required),
    jobCategoryId: new FormControl('', Validators.required),
    jobCompanyWebsite: new FormControl('', Validators.required),
    jobLocation: new FormControl('', Validators.required),
    huDetails: new FormGroup({
      jobTitle: new FormControl('', Validators.required),
      jobAboutUs: new FormControl('', Validators.required),
      jobDescription: new FormControl('', Validators.required),
      jobPayment: new FormControl('', Validators.required),
      jobType: new FormControl('', Validators.required),
      jobExperience: new FormControl('', Validators.required),
      jobQualification: new FormControl('', Validators.required),
      jobLanguage: new FormControl('', Validators.required)
    }),
    enDetails: new FormGroup({
      jobTitle: new FormControl(''),
      jobAboutUs: new FormControl(''),
      jobDescription: new FormControl(''),
      jobPayment: new FormControl(''),
      jobType: new FormControl(''),
      jobExperience: new FormControl(''),
      jobQualification: new FormControl(''),
      jobLanguage: new FormControl('')
    })
  });
  isDropdownOpen: boolean = false;
  isModify: boolean = false;
  selectedJob!: DropdownData;
  jobDropdownData: DropdownData[] = new Array();
  jobDropdownControl: FormControl = new FormControl('', Validators.required);
  jobData!: Job;
  jobDropdownLabel: string = '';
  selectJobErrorText: string = '';
  jobSubtitleText: string = '';
  imageUrl: any = '';
  imageChanging: boolean = false;
  fileData!: File | string;
  jobQueried: boolean = true;
  modifyDialogRefSubscription: Subscription = new Subscription();
  categories: Category[] = new Array();
  selectedCategory!: Category;
  isCategoryDropdownOpen: boolean = false;

  constructor(private languageService: LanguageService,
    public dialog: MatDialog,
    private dataService: DataService,
    private router: Router) { }

  ngOnInit(): void {
    if (this.router.url.includes('modositas')) {
      this.jobQueried = false;
      this.isModify = true;
      this.dataService.getAllData('/api/jobs/public/getJobDropdwonDataByToken', this.dataService.getAuthHeader()).subscribe(res => {
        this.jobDropdownData = res.map(element => {
          let newElement = { key: element.id, value: element.companyName };
          return newElement;
        });
      });
    }
    this.initData();
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
    this.modifyDialogRefSubscription.unsubscribe();
  }

  handleProfilePicture(event: any) {
    this.fileData = event.target.files[0] as File;
    const files = event.target.files;
    const reader = new FileReader();
    this.jobForm.controls.jobCompanyLogo.setValue('value');
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imageUrl = reader.result;
      this.imageChanging = true;
    }
  }

  setDropdownData(data: DropdownData) {
    this.selectedJob = data;
    this.jobDropdownControl.setValue(data.value);
    this.isDropdownOpen = false;
  }

  setFormData() {
    this.queriedJobId = this.selectedJob.key;
    this.jobQueried = true;
    this.dataService.getOneData('/api/jobs/public/getJobByIdAndToken/' + this.queriedJobId, this.dataService.getAuthHeader()).subscribe(res => {
      this.jobData = res;
      const huJobDetails = this.jobData.JobTranslations.find(element => element.languageId == 1);
      const enJobDetails = this.jobData.JobTranslations.find(element => element.languageId == 2);
      this.selectedCategory = this.categories.find(element => element.id == this.jobData.categoryId)!;
      this.languageService.languageObservable$.subscribe(lang => {
        this.selectedCategory.selectedTranslation = this.languageService.getTranslation(lang, this.selectedCategory.CategoryTranslations);
      });
      if (this.jobData.logoUrl) {
        this.imageUrl = this.jobData.logoUrl;
      } else {
        this.imageUrl = '';
      }
      let formValue = {
        jobCompanyName: this.jobData.companyName,
        jobCompanyLogo: this.jobData.logoUrl,
        jobCompanyWebsite: this.jobData.companyWebsite,
        jobLocation: this.jobData.jobLocation,
        jobCategoryId: this.selectedCategory.selectedTranslation.text,
        huDetails: {
          jobTitle: huJobDetails?.title,
          jobAboutUs: huJobDetails?.aboutUs,
          jobDescription: huJobDetails?.jobDescription,
          jobPayment: huJobDetails?.payment,
          jobType: huJobDetails?.jobType,
          jobExperience: huJobDetails?.experience,
          jobQualification: huJobDetails?.qualification,
          jobLanguage: huJobDetails?.language
        },
        enDetails: {
          jobTitle: enJobDetails ? enJobDetails.title : '',
          jobAboutUs: enJobDetails ? enJobDetails.aboutUs : '',
          jobDescription: enJobDetails ? enJobDetails.jobDescription : '',
          jobPayment: enJobDetails ? enJobDetails.payment : '',
          jobType: enJobDetails ? enJobDetails.jobType : '',
          jobExperience: enJobDetails ? enJobDetails.experience : '',
          jobQualification: enJobDetails ? enJobDetails.qualification : '',
          jobLanguage: enJobDetails ? enJobDetails.language : ''
        }
      }
      this.jobForm.setValue(formValue);
    });
  }

  initData() {
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/employerJobs/public'),
      this.dataService.getAllData('/api/generalMessages/public'),
      this.dataService.getAllData('/api/errorMessages/public'),
      this.dataService.getAllData('/api/languages/public'),
      this.dataService.getAllData('/api/categories/public')
    ]).subscribe(res => {
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        if(lang){
          this.createJobTitleText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'createJobTitle', 'PublicContentTranslations');
          this.modifyJobTitleText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'modifyJobTitle', 'PublicContentTranslations');
          this.sendButtonText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'saveJobButtonText', 'PublicContentTranslations');
          this.hunSubtitleText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'jobHunLanguageSubtitle', 'PublicContentTranslations');
          this.enSubtitleText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'jobEnLanguageSubtitle', 'PublicContentTranslations');
          this.jobDropdownLabel = this.languageService.getTranslationByKey(lang, res[0], 'title', 'selectJobText', 'PublicContentTranslations');
          this.jobSubtitleText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'handleJobSubtitle', 'PublicContentTranslations');
          this.choosePictureButtonText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'choosePictureButtonText', 'PublicContentTranslations');
          this.getJobDataButtonText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'getJobDataButtonText', 'PublicContentTranslations');
  
          this.jobFormElements = this.jobFormElements.map(element => {
            element.placeholder = this.languageService.getTranslationByKey(lang, res[0], 'title', element.key, 'PublicContentTranslations');
            return element;
          });
  
          this.jobFormDetailElements = this.jobFormDetailElements.map(element => {
            element.placeholder = this.languageService.getTranslationByKey(lang, res[0], 'title', element.key, 'PublicContentTranslations');
            return element;
          });
  
          this.successfulSaveJobText = this.languageService.getTranslationByKey(lang, res[1], 'text', 'successfulJobCreate', 'GeneralMessageTranslations');
          this.successfulModifyJobText = this.languageService.getTranslationByKey(lang, res[1], 'text', 'successfulModifyJob', 'GeneralMessageTranslations');
  
          this.requiredFieldErrorText = this.languageService.getTranslationByKey(lang, res[2], 'text', 'requiredFieldErrorMessage', 'ErrorMessageTranslations');
          this.selectJobErrorText = this.languageService.getTranslationByKey(lang, res[2], 'text', 'selectJobNeededErrorText', 'ErrorMessageTranslations');
  
          this.hunLanguage = res[3].find(element => element.key == 'hu');
          this.hunLanguage.selectedTranslation = this.languageService.getTranslation(lang, this.hunLanguage.LanguageTranslations);
          this.enLanguage = res[3].find(element => element.key == 'en');
          this.enLanguage.selectedTranslation = this.languageService.getTranslation(lang, this.enLanguage.LanguageTranslations);
  
          this.categories = res[4].map((element: Category) => {
            element.selectedTranslation = this.languageService.getTranslation(lang, element.CategoryTranslations);
            return element;
          });
        }
      });
    });
  }

  setJobLanguageKey(key: string) {
    this.jobLanguageKey = key;
  }

  saveJob() {
    if (!this.queriedJobId && this.isModify) {
      this.dialog.open(MessageDialogComponent, {
        data: { icon: 'done', text: this.selectJobErrorText },
        backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
        disableClose: true
      });
      return;
    }
    this.isUserClicked = true;
    if (this.jobForm.valid) {
      let formValue = { ...this.jobForm.value };
      let result: any = {
        companyName: formValue.jobCompanyName,
        companyWebsite: formValue.jobCompanyWebsite,
        jobLocation: formValue.jobLocation,
        hunTitle: formValue.huDetails.jobTitle,
        hunAboutUs: formValue.huDetails.jobAboutUs,
        hunJobDescription: formValue.huDetails.jobDescription,
        hunPayment: formValue.huDetails.jobPayment,
        hunJobType: formValue.huDetails.jobType,
        hunExperience: formValue.huDetails.jobExperience,
        hunQualification: formValue.huDetails.jobQualification,
        hunLanguage: formValue.huDetails.jobLanguage,
        enTitle: formValue.enDetails.jobTitle,
        enAboutUs: formValue.enDetails.jobAboutUs,
        enJobDescription: formValue.enDetails.jobDescription,
        enPayment: formValue.enDetails.jobPayment,
        enJobType: formValue.enDetails.jobType,
        enExperience: formValue.enDetails.jobExperience,
        enQualification: formValue.enDetails.jobQualification,
        enLanguage: formValue.enDetails.jobLanguage,
        categoryId: this.selectedCategory.id,
        imageChanging: this.imageChanging,
      };
      let formData = new FormData();
      const attributes = Object.keys(result);
      for (let i = 0; i < attributes.length; ++i) {
        formData.append(attributes[i], result[attributes[i]]);
      }
      if (this.imageChanging) {
        formData.append('logoUrl', this.fileData);
      }
      if (this.isModify) {
        this.dataService.httpPutMethod('/api/jobs/public/modifyJob', this.queriedJobId, formData, this.dataService.getAuthHeader()).subscribe(res => {
          const modifyDialogRef = this.dialog.open(MessageDialogComponent, {
            data: { icon: 'done', text: this.successfulModifyJobText },
            backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
            disableClose: true
          });
          this.modifyDialogRefSubscription = modifyDialogRef.afterClosed().subscribe(() => {
            this.jobQueried = false;
            this.isUserClicked = false;
            this.fileData = '';
            this.imageUrl = '';
            this.imageChanging = false;
            this.jobForm.reset();
          });
        });
      } else {
        this.dataService.httpPostMethod('/api/jobs/public/createJob', formData, this.dataService.getAuthHeader()).subscribe(res => {
          this.isUserClicked = false;
          this.dialog.open(MessageDialogComponent, {
            data: { icon: 'done', text: this.successfulSaveJobText },
            backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
            disableClose: true
          });
          this.isUserClicked = false;
          this.fileData = '';
          this.imageUrl = '';
          this.imageChanging = false;
          this.jobForm.reset();
        });
      }
    }
  }

  openDropdown(element: FormElement) {
    element.focus = !element.focus;
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  setSelectedCategory(category: Category) {
    this.selectedCategory = category;
    this.jobForm.controls.jobCategoryId.setValue(category.selectedTranslation.text);
  }

}
