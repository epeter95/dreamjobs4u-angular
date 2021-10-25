import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { LanguageService } from 'src/app/services/language.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  sendButtonText: string = '';
  changePasswordTitleText: string = '';
  profileDataSubscription: Subscription = new Subscription();
  profileData!: UserProfileData;
  
  changePasswordFormElements: FormElement[] = [
    { key: 'profileCurrentPassword', placeholder: '', focus: false, type: 'password' },
    { key: 'profileNewPassword', placeholder: '', focus: false, type: 'password' },
    { key: 'profileNewPasswordAgain', placeholder: '', focus: false, type: 'password' }
  ];

  changePasswordForm: FormGroup = new FormGroup({
    profileCurrentPassword: new FormControl('' ,Validators.required),
    profileNewPassword: new FormControl('',Validators.required),
    profileNewPasswordAgain: new FormControl('',Validators.required)
  });
  
  constructor(private profileService: ProfileService,
    private languageService: LanguageService) { }

  ngOnInit(): void {
    this.initData();
  }

  initData(){
    this.profileDataSubscription = this.profileService.profileDataObservable$.subscribe(res => {
      if(res.length > 0){
        this.profileData = res[0];
        this.languageService.languageObservable$.subscribe(lang => {
          this.changePasswordTitleText = this.languageService.getTranslationByKey(lang, res[1], 'title', 'profileChangePasswordTitle', 'PublicContentTranslations');
          this.sendButtonText = this.languageService.getTranslationByKey(lang, res[1], 'title', 'profileSendButtonText', 'PublicContentTranslations');
          this.changePasswordFormElements = this.changePasswordFormElements.map(element => {
            this.changePasswordForm.controls[element.key].setValue(res[0][element.profileDataKey!] ? res[0][element.profileDataKey!] : res[0]['Profile'][element.profileDataKey!]);
            element.placeholder = this.languageService.getTranslationByKey(lang, res[1], 'title', element.key, 'PublicContentTranslations');
            return element;
          });
        });
      }
    });
  }

  changePassword(){

  }

}
