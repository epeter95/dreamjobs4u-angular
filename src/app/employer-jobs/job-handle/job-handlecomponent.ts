import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { DropdownData } from 'src/app/interfaces/dropdown';
import { FormElement } from 'src/app/interfaces/form-element';
import { Job } from 'src/app/interfaces/job';
import { Language } from 'src/app/interfaces/language';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

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

  jobFormElements: FormElement[] = [
    { key: 'jobCompanyName', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobCompanyLogo', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobCompanyWebsite', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobLocation', placeholder: '', focus: false, fieldType: 'input' }
  ];

  jobFormDetailElements: FormElement[] = [
    { key: 'jobTitle', placeholder: '', focus: false, fieldType: 'input', widthClass: 'form-field-full-width' },
    { key: 'jobAboutUs', placeholder: '', focus: false, fieldType: 'textarea' },
    { key: 'jobDescription', placeholder: '', focus: false, fieldType: 'textarea' }
  ]

  jobForm: FormGroup = new FormGroup({
    jobCompanyName: new FormControl('', Validators.required),
    jobCompanyLogo: new FormControl('', Validators.required),
    jobCompanyWebsite: new FormControl('', Validators.required),
    jobLocation: new FormControl('', Validators.required),
    huDetails: new FormGroup({
      jobTitle: new FormControl('', Validators.required),
      jobAboutUs: new FormControl('', Validators.required),
      jobDescription: new FormControl('', Validators.required)
    }),
    enDetails: new FormGroup({
      jobTitle: new FormControl(''),
      jobAboutUs: new FormControl(''),
      jobDescription: new FormControl('')
    })
  });
  isDropdownOpen: boolean = false;
  isModify: boolean = false;
  selectedJob!: DropdownData;
  jobDropdownData: DropdownData[] = new Array();
  jobDropdownControl: FormControl = new FormControl('', Validators.required);
  jobData!: Job;

  constructor(private languageService: LanguageService,
    public dialog: MatDialog,
    private dataService: DataService,
    private router: Router) { }

  ngOnInit(): void {
    if(this.router.url.includes('modositas')){
      this.isModify = true;
      this.dataService.getAllData('/api/jobs/public/getJobDropdwonDataByToken',this.dataService.getAuthHeader()).subscribe(res=>{
        this.jobDropdownData = res.map(element=>{
          let newElement = { key: element.id, value: element.companyName};
          return newElement;
        });
      });
    }
    this.initData();
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }

  setDropdownData(data: DropdownData){
    this.selectedJob = data;
    this.jobDropdownControl.setValue(data.value);
    this.isDropdownOpen = false;
    console.log(this.isDropdownOpen);
  }

  setFormData(){
    this.dataService.getOneData('/api/jobs/public/getJobByIdAndToken/'+this.selectedJob.key,this.dataService.getAuthHeader()).subscribe(res=>{
      this.jobData = res;
      const huJobDetails = this.jobData.JobTranslations.find(element=>element.languageId == 1);
      const enJobDetails = this.jobData.JobTranslations.find(element=>element.languageId == 2);
      let formValue = {
        jobCompanyName: this.jobData.companyName,
        jobCompanyLogo: this.jobData.logoUrl,
        jobCompanyWebsite: this.jobData.companyWebsite,
        jobLocation: this.jobData.jobLocation,
        huDetails: {
          jobTitle: huJobDetails?.title,
          jobAboutUs: huJobDetails?.aboutUs,
          jobDescription: huJobDetails?.jobDescription,
        },
        enDetails: {
          jobTitle: enJobDetails? enJobDetails.title : '',
          jobAboutUs: enJobDetails? enJobDetails.aboutUs : '',
          jobDescription: enJobDetails? enJobDetails.jobDescription : '',
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
      this.dataService.getAllData('/api/languages/public')
    ]).subscribe(res=>{
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        this.createJobTitleText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'createJobTitle', 'PublicContentTranslations');
        this.modifyJobTitleText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'modifyJobTitle', 'PublicContentTranslations');
        this.sendButtonText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'saveJobButtonText', 'PublicContentTranslations');
        this.hunSubtitleText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'jobHunLanguageSubtitle', 'PublicContentTranslations');
        this.enSubtitleText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'jobEnLanguageSubtitle', 'PublicContentTranslations');
        this.jobFormElements = this.jobFormElements.map(element => {
          element.placeholder = this.languageService.getTranslationByKey(lang, res[0], 'title', element.key, 'PublicContentTranslations');
          return element;
        });

        this.jobFormDetailElements = this.jobFormDetailElements.map(element => {
          element.placeholder = this.languageService.getTranslationByKey(lang, res[0], 'title', element.key, 'PublicContentTranslations');
          return element;
        });
        this.successfulSaveJobText = this.languageService.getTranslationByKey(lang, res[1], 'text', 'successfulJobCreate', 'GeneralMessageTranslations');
        this.requiredFieldErrorText = this.languageService.getTranslationByKey(lang,res[2],'text','requiredFieldErrorMessage', 'ErrorMessageTranslations');
        this.hunLanguage = res[3].find(element=>element.key == 'hu');
        this.hunLanguage.selectedTranslation = this.languageService.getTranslation(lang,this.hunLanguage.LanguageTranslations);
        this.enLanguage = res[3].find(element=>element.key == 'en');
        this.enLanguage.selectedTranslation = this.languageService.getTranslation(lang,this.enLanguage.LanguageTranslations);
      });
    });
  }

  setJobLanguageKey(key: string){
    this.jobLanguageKey = key;
  }

  saveJob(){
    this.isUserClicked = true;
    if(this.jobForm.valid){
      let formValue = {...this.jobForm.value};
      let result = {
        companyName: formValue.jobCompanyName,
        companyWebsite: formValue.jobCompanyLogo,
        logoUrl: formValue.jobCompanyWebsite,
        jobLocation: formValue.jobLocation,
        hunTitle: formValue.huDetails.jobTitle,
        hunAboutUs: formValue.huDetails.jobAboutUs,
        hunJobDescription: formValue.huDetails.jobDescription,
        enTitle: formValue.enDetails.jobTitle,
        enAboutUs: formValue.enDetails.jobAboutUs,
        enJobDescription: formValue.enDetails.jobDescription
      };
      this.dataService.httpPostMethod('/api/jobs/public/createJob',result,this.dataService.getAuthHeader()).subscribe(res=>{
        console.log(res);
        this.isUserClicked = false;
        this.dialog.open(MessageDialogComponent,{
          data: {icon: 'done', text: this.successfulSaveJobText},
          backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
          disableClose: true
        })
      });
    }
  }

}
