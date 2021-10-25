import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { DataService } from 'src/app/services/data.service';
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
  passwordMismatchErrorText: string = '';
  passwordDoesntMatchErrorText: string = '';
  passwordDoesntMatch: boolean = false;
  passwordMismatch: boolean = false;
  requiredFieldErrorText: string = '';
  isUserClicked: boolean = false;
  successfulPasswordChangeText: string = '';
  
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
    private languageService: LanguageService,
    private dataService: DataService,
    public dialog: MatDialog) { }

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
          this.successfulPasswordChangeText = this.languageService.getTranslationByKey(lang,res[2],'text','successfulPasswordChange', 'GeneralMessageTranslations');
          this.passwordMismatchErrorText = this.languageService.getTranslationByKey(lang,res[3],'text','passwordMismatchConfirmPassword', 'ErrorMessageTranslations');
          this.passwordDoesntMatchErrorText = this.languageService.getTranslationByKey(lang,res[3],'text','passwordDoesntMatch', 'ErrorMessageTranslations');
          this.requiredFieldErrorText = this.languageService.getTranslationByKey(lang,res[3],'text','requiredFieldErrorMessage', 'ErrorMessageTranslations');
        });
      }
    });
  }

  changePassword(){
    this.isUserClicked = true;
    if(this.changePasswordForm.valid){
      this.closeErrorMessage();
      if(this.changePasswordForm.controls.profileNewPassword.value != this.changePasswordForm.controls.profileNewPasswordAgain.value){
        this.passwordMismatch = true;
        return;
      }
      let result = {
        currentPassword: this.changePasswordForm.controls.profileCurrentPassword.value,
        password: this.changePasswordForm.controls.profileNewPassword.value
      }
      this.dataService.httpPostMethod('/api/users/public/changePassword',result,this.dataService.getAuthHeader()).subscribe(res=>{
        this.closeErrorMessage();
        this.changePasswordForm.reset();
        this.isUserClicked = false;
        this.dialog.open(MessageDialogComponent, {
          data: { icon: 'done', text: this.successfulPasswordChangeText },
          backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
          disableClose: true
        });
      },error=>{
        if(error.status == 401){
          this.passwordDoesntMatch = true;
        }
      });
    }
  }

  closeErrorMessage(){
    this.passwordDoesntMatch = false;
    this.passwordMismatch = false;
  }

}
