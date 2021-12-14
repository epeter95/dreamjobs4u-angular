import { HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { GeneralMessage } from 'src/app/interfaces/general-message';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
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
  languageSubscription: Subscription = new Subscription();
  profileData!: UserProfileData;
  successfulContactInfoText: string = '';
  publicContents: PublicContent[] = new Array();
  generalMessages: GeneralMessage[] = new Array();
  pageLoaded!: Promise<boolean>;

  contactInfoFormElements: FormElement[] = [
    { key: 'profileCountry', placeholder: '', focus: false, profileDataKey: 'country' },
    { key: 'profileZipcode', placeholder: '', focus: false, profileDataKey: 'zipcode' },
    { key: 'profileCity', placeholder: '', focus: false, profileDataKey: 'city' },
    { key: 'profileAddress', placeholder: '', focus: false, profileDataKey: 'address' },
    { key: 'profilePhone', placeholder: '', focus: false, profileDataKey: 'phone' }
  ];

  contactInfoForm: FormGroup = new FormGroup({
    profileCountry: new FormControl(''),
    profileZipcode: new FormControl(''),
    profileCity: new FormControl(''),
    profileAddress: new FormControl(''),
    profilePhone: new FormControl(''),
  });

  constructor(private languageService: LanguageService,
    private profileService: ProfileService,
    public dialog: MatDialog,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.initData();
  }
  //szükséges feliratkozások megszüntetése
  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }
  //profil adatok, publikus tartamak, általános üzenetek lekérdezése, fordítások beállítása
  initData() {
    forkJoin([
      this.dataService.getOneData('/api/profiles/getProfileDataForPublic',this.dataService.getAuthHeader()),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public'),
      this.dataService.getAllData('/api/generalMessages/public')
    ]).subscribe(res => {
        this.profileData = res[0];
        this.publicContents = res[1];
        this.generalMessages = res[2];
        this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
          if(lang){
            this.contactInfoTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileContactTitle', 'PublicContentTranslations');
            this.sendButtonText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileSendButtonText', 'PublicContentTranslations');
            this.contactInfoFormElements = this.contactInfoFormElements.map(element => {
              const attribute = element.profileDataKey ? element.profileDataKey : '';
              this.contactInfoForm.controls[element.key].setValue(res[0][attribute] ? res[0][attribute] : res[0]['Profile'][attribute]);
              element.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', element.key, 'PublicContentTranslations');
              element.value = res[0][attribute] ? res[0][attribute] : res[0]['Profile'][attribute]
              return element;
            });
            this.successfulContactInfoText = this.languageService.getTranslationByKey(lang, this.generalMessages, 'text', 'successfulContactChange', 'GeneralMessageTranslations');
            this.pageLoaded = Promise.resolve(true);
          }
        });
    });
  }
  //kontakt információ adatok elmentése
  saveInfos() {
    let profileResult = {
      country: this.contactInfoForm.controls.profileCountry.value,
      city: this.contactInfoForm.controls.profileCity.value,
      phone: this.contactInfoForm.controls.profilePhone.value,
      zipcode: this.contactInfoForm.controls.profileZipcode.value,
      address: this.contactInfoForm.controls.profileAddress.value
    }
    this.dataService.httpPostMethod('/api/profiles/public/modifyProfileData', profileResult, this.dataService.getAuthHeader()).subscribe(res => {
      this.dialog.open(MessageDialogComponent, {
        data: { icon: 'done', text: this.successfulContactInfoText },
        backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
        disableClose: true
      });
    });
  }

}
