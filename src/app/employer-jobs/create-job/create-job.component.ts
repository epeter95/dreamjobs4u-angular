import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-create-job',
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss']
})
export class CreateJobComponent implements OnInit, OnDestroy {
  sendButtonText: string = '';
  createJobTitleText: string = '';
  successfulSaveJobText: string = '';
  requiredFieldErrorText: string = '';
  isUserClicked: boolean = false;
  languageSubscription: Subscription = new Subscription();

  jobFormElements: FormElement[] = [
    { key: 'jobCompanyName', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobCompanyLogo', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobCompanyWebsite', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobLocation', placeholder: '', focus: false, fieldType: 'input' },
    { key: 'jobTitle', placeholder: '', focus: false, fieldType: 'input', widthClass: 'form-field-full-width' },
    { key: 'jobAboutUs', placeholder: '', focus: false, fieldType: 'textarea' },
    { key: 'jobDescription', placeholder: '', focus: false, fieldType: 'textarea' }
  ];

  jobForm: FormGroup = new FormGroup({
    jobCompanyName: new FormControl('', Validators.required),
    jobCompanyLogo: new FormControl('', Validators.required),
    jobCompanyWebsite: new FormControl('', Validators.required),
    jobLocation: new FormControl('', Validators.required),
    jobTitle: new FormControl('', Validators.required),
    jobAboutUs: new FormControl('', Validators.required),
    jobDescription: new FormControl('', Validators.required)
  });

  constructor(private languageService: LanguageService,
    public dialog: MatDialog,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.initData();
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }

  initData() {
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/employerJobs/public'),
      this.dataService.getAllData('/api/generalMessages/public'),
      this.dataService.getAllData('/api/errorMessages/public')
    ]).subscribe(res=>{
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        this.createJobTitleText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'createJobTitle', 'PublicContentTranslations');
        this.sendButtonText = this.languageService.getTranslationByKey(lang, res[0], 'title', 'saveJobButtonText', 'PublicContentTranslations');
        this.jobFormElements = this.jobFormElements.map(element => {
          element.placeholder = this.languageService.getTranslationByKey(lang, res[0], 'title', element.key, 'PublicContentTranslations');
          return element;
        });
        this.successfulSaveJobText = this.languageService.getTranslationByKey(lang, res[1], 'text', 'successfulJobModify', 'GeneralMessageTranslations');
        this.requiredFieldErrorText = this.languageService.getTranslationByKey(lang,res[2],'text','requiredFieldErrorMessage', 'ErrorMessageTranslations');
      });
    });
  }

  saveJob(){
    this.isUserClicked = true;
    if(this.jobForm.valid){
      let result = {
        companyName: this.jobForm.controls.jobCompanyName.value,
        companyWebsite: this.jobForm.controls.jobCompanyLogo.value,
        logoUrl: this.jobForm.controls.jobCompanyWebsite.value,
        jobLocation: this.jobForm.controls.jobLocation.value,
        title: this.jobForm.controls.jobTitle.value,
        aboutUs: this.jobForm.controls.jobAboutUs.value,
        jobDescription: this.jobForm.controls.jobDescription.value
      };
    }
  }

}
