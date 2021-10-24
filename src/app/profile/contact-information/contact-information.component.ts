import { HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';
import { ProfileService } from 'src/app/services/profile.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-contact-information',
  templateUrl: './contact-information.component.html',
  styleUrls: ['./contact-information.component.scss']
})
export class ContactInformationComponent implements OnInit, OnDestroy {
  sendButtonText: string = '';
  contactInfoTitleText: string = '';
  profileDataSubscription: Subscription = new Subscription();
  profileData!: UserProfileData;
  contactInfoFormElements: FormElement[] = [
    { key: 'profileCountry', placeholder: '', focus: false, profileDataKey: 'country' },
    { key: 'profileCity', placeholder: '', focus: false, profileDataKey: 'city' },
    { key: 'profileAddress', placeholder: '', focus: false, profileDataKey: 'address' },
    { key: 'profilePhone', placeholder: '', focus: false, profileDataKey: 'phone'},
    { key: 'profileZipcode', placeholder: '', focus: false, profileDataKey: 'zipcode'}
  ];

  contactInfoForm: FormGroup = new FormGroup({
    profileCountry: new FormControl(''),
    profileCity: new FormControl(''),
    profileAddress: new FormControl(''),
    profilePhone: new FormControl(''),
    profileZipcode: new FormControl(''),
  });
  constructor(private languageService: LanguageService,
    private profileService: ProfileService,
    private sessionService: SessionService,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.initData();
  }

  ngOnDestroy(){
    this.profileDataSubscription.unsubscribe();
  }

  initData(){
    this.profileDataSubscription = this.profileService.profileDataObservable$.subscribe(res => {
      if(res.length > 0){
        this.profileData = res[0];
        this.languageService.languageObservable$.subscribe(lang => {
          this.contactInfoTitleText = this.languageService.getTranslationByKey(lang, res[1], 'title', 'profileContactTitle', 'PublicContentTranslations');
          this.sendButtonText = this.languageService.getTranslationByKey(lang, res[1], 'title', 'profileSendButtonText', 'PublicContentTranslations');
          this.contactInfoFormElements = this.contactInfoFormElements.map(element => {
            this.contactInfoForm.controls[element.key].setValue(res[0][element.profileDataKey!] ? res[0][element.profileDataKey!] : res[0]['Profile'][element.profileDataKey!]);
            element.placeholder = this.languageService.getTranslationByKey(lang, res[1], 'title', element.key, 'PublicContentTranslations');
            element.value = res[0][element.profileDataKey!] ? res[0][element.profileDataKey!] : res[0]['Profile'][element.profileDataKey!]
            return element;
          });
        });
      }
    });
  }

  saveInfos(){
    let profileResult = {
      country: this.contactInfoForm.controls.profileCountry.value,
      city: this.contactInfoForm.controls.profileCity.value,
      phone: this.contactInfoForm.controls.profilePhone.value,
      zipcode: this.contactInfoForm.controls.profileZipcode.value,
      address: this.contactInfoForm.controls.profileAddress.value
    }
    let headers = new HttpHeaders().set("Authorization", 'Bearer ' + this.sessionService.getSession());
    this.dataService.httpPostMethod('/api/profiles/public/modifyProfileData',profileResult,headers).subscribe(res=>{
      console.log(res);
    });
  }

}
