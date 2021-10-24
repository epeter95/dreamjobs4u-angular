import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-contact-information',
  templateUrl: './contact-information.component.html',
  styleUrls: ['./contact-information.component.scss']
})
export class ContactInformationComponent implements OnInit {
  sendButtonText: string = '';
  contactInfoTitleText: string = '';
  contactInfoFormElements: FormElement[] = [
    { key: 'profileCountry', placeholder: '', focus: false },
    { key: 'profileCity', placeholder: '', focus: false },
    { key: 'profileAddress', placeholder: '', focus: false },
    { key: 'profilePhone', placeholder: '', focus: false},
    { key: 'profileZipcode', placeholder: '', focus: false}
  ];

  contactInfoForm: FormGroup = new FormGroup({
    profileCountry: new FormControl(''),
    profileCity: new FormControl(''),
    profileAddress: new FormControl(''),
    profilePhone: new FormControl(''),
    profileZipcode: new FormControl(''),
  });
  constructor(private dataService: DataService,private languageService: LanguageService) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public'),
      this.dataService.getAllData('/api/generalMessages/public'),
      this.dataService.getAllData('/api/errorMessages/public')
    ]).subscribe(res=>{
      this.languageService.languageObservable$.subscribe(lang=>{
        this.contactInfoTitleText = this.languageService.getTranslationByKey(lang,res[0],'title','profileContactTitle','PublicContentTranslations');
        this.sendButtonText = this.languageService.getTranslationByKey(lang,res[0],'title','profileSendButtonText','PublicContentTranslations');
        this.contactInfoFormElements = this.contactInfoFormElements.map(element=>{
          element.placeholder = this.languageService.getTranslationByKey(lang,res[0],'title',element.key,'PublicContentTranslations');
          return element;
        });
      });  
    });
  }

  saveInfos(){

  }

}
