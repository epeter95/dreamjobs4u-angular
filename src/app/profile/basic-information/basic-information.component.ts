import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-basic-information',
  templateUrl: './basic-information.component.html',
  styleUrls: ['./basic-information.component.scss']
})
export class BasicInformationComponent implements OnInit {
  basicInfoTitleText: string = '';
  sendButtonText: string = '';

  basicInfoFormElements: FormElement[] = [
    { key: 'profileFirstName', placeholder: '', focus: false },
    { key: 'profileLastName', placeholder: '', focus: false },
    { key: 'profileJobTitle', placeholder: '', focus: false },
    { key: 'profileAge', placeholder: '', focus: false},
    { key: 'profileCurrentSalary', placeholder: '', focus: false},
    { key: 'profileExpectedSalary', placeholder: '', focus: false},
    { key: 'profileDescription', placeholder: '', focus: false, fieldType: 'textarea'}
  ];
  
  basicInfoForm: FormGroup = new FormGroup({
    profileFirstName: new FormControl(''),
    profileLastName: new FormControl(''),
    profileJobTitle: new FormControl(''),
    profileAge: new FormControl(''),
    profileCurrentSalary: new FormControl(''),
    profileExpectedSalary: new FormControl(''),
    profileDescription: new FormControl(''),
  });

  constructor(private dataService: DataService,private languageService: LanguageService) {}

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public'),
      this.dataService.getAllData('/api/generalMessages/public'),
      this.dataService.getAllData('/api/errorMessages/public')
    ]).subscribe(res=>{
      this.languageService.languageObservable$.subscribe(lang=>{
        this.basicInfoTitleText = this.languageService.getTranslationByKey(lang,res[0],'title','profileBasicInfoTitle','PublicContentTranslations');
        this.sendButtonText = this.languageService.getTranslationByKey(lang,res[0],'title','profileSendButtonText','PublicContentTranslations');
        this.basicInfoFormElements = this.basicInfoFormElements.map(element=>{
          element.placeholder = this.languageService.getTranslationByKey(lang,res[0],'title',element.key,'PublicContentTranslations');
          return element;
        });
      });
    });
  }

  saveInfos(){

  }

}
