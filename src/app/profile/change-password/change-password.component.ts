import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { ErrorMessage } from 'src/app/interfaces/error-message';
import { FormElement } from 'src/app/interfaces/form-element';
import { GeneralMessage } from 'src/app/interfaces/general-message';
import { PublicContent } from 'src/app/interfaces/public-contents';
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
export class ChangePasswordComponent implements OnInit, OnDestroy {

  sendButtonText: string = '';
  changePasswordTitleText: string = '';
  languageSubscription: Subscription = new Subscription();
  profileData!: UserProfileData;
  passwordMismatchErrorText: string = '';
  passwordDoesntMatchErrorText: string = '';
  passwordDoesntMatch: boolean = false;
  passwordMismatch: boolean = false;
  requiredFieldErrorText: string = '';
  isUserClicked: boolean = false;
  successfulPasswordChangeText: string = '';
  publicContents: PublicContent[] = new Array();
  generalMessages: GeneralMessage[] = new Array();
  errorMessages: ErrorMessage[] = new Array();
  pageLoaded!: Promise<boolean>;

  changePasswordFormElements: FormElement[] = [
    { key: 'profileCurrentPassword', placeholder: '', focus: false, type: 'password' },
    { key: 'profileNewPassword', placeholder: '', focus: false, type: 'password' },
    { key: 'profileNewPasswordAgain', placeholder: '', focus: false, type: 'password' }
  ];

  changePasswordForm: FormGroup = new FormGroup({
    profileCurrentPassword: new FormControl('', Validators.required),
    profileNewPassword: new FormControl('', Validators.required),
    profileNewPasswordAgain: new FormControl('', Validators.required)
  });

  constructor(private profileService: ProfileService,
    private languageService: LanguageService,
    private dataService: DataService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.initData();
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

  initData() {
    forkJoin([
      this.dataService.getOneData('/api/profiles/getProfileDataForPublic', this.dataService.getAuthHeader()),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public'),
      this.dataService.getAllData('/api/generalMessages/public'),
      this.dataService.getAllData('/api/errorMessages/public')
    ]).subscribe(res => {
      this.profileData = res[0];
      this.publicContents = res[1];
      this.generalMessages = res[2];
      this.errorMessages = res[3];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        if(lang){
          this.changePasswordTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileChangePasswordTitle', 'PublicContentTranslations');
          this.sendButtonText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileSendButtonText', 'PublicContentTranslations');
          this.changePasswordFormElements = this.changePasswordFormElements.map(element => {
            const attribute = element.profileDataKey ? element.profileDataKey : '';
            this.changePasswordForm.controls[element.key].setValue(res[0][attribute] ? res[0][attribute] : res[0]['Profile'][attribute]);
            element.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', element.key, 'PublicContentTranslations');
            return element;
          });
          this.successfulPasswordChangeText = this.languageService.getTranslationByKey(lang, this.generalMessages, 'text', 'successfulPasswordChange', 'GeneralMessageTranslations');
          this.passwordMismatchErrorText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'passwordMismatchConfirmPassword', 'ErrorMessageTranslations');
          this.passwordDoesntMatchErrorText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'passwordDoesntMatch', 'ErrorMessageTranslations');
          this.requiredFieldErrorText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'requiredFieldErrorMessage', 'ErrorMessageTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }

  changePassword() {
    this.isUserClicked = true;
    if (this.changePasswordForm.valid) {
      this.closeErrorMessage();
      if (this.changePasswordForm.controls.profileNewPassword.value != this.changePasswordForm.controls.profileNewPasswordAgain.value) {
        this.passwordMismatch = true;
        return;
      }
      let result = {
        currentPassword: this.changePasswordForm.controls.profileCurrentPassword.value,
        password: this.changePasswordForm.controls.profileNewPassword.value
      }
      this.dataService.httpPostMethod('/api/users/public/changePassword', result, this.dataService.getAuthHeader()).subscribe(res => {
        this.closeErrorMessage();
        this.changePasswordForm.reset();
        this.isUserClicked = false;
        this.dialog.open(MessageDialogComponent, {
          data: { icon: 'done', text: this.successfulPasswordChangeText },
          backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
          disableClose: true
        });
      }, error => {
        if (error.status == 401) {
          this.passwordDoesntMatch = true;
        }
      });
    }
  }

  closeErrorMessage() {
    this.passwordDoesntMatch = false;
    this.passwordMismatch = false;
  }

}
