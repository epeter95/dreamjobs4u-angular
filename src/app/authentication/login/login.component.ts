import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { ErrorMessage } from 'src/app/interfaces/error-message';
import { FormElement } from 'src/app/interfaces/form-element';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';
import { RoleService } from 'src/app/services/role.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  languageSubscription: Subscription = new Subscription();
  loginTitleText: string = '';
  loginSubtitleText: string = '';
  loginButtonText: string = '';
  isUserClicked: boolean = false;
  requiredFieldErrorText: string = '';
  isUserMissing: boolean = false;
  passwordDoesntMatch: boolean = false;
  wrongEmailFormatErrorText: string = '';
  missingUserText: string = '';
  passwordDoesntMatchtext: string = '';
  loginFormElements: FormElement[] = [
    { key: 'loginEmail', placeholder: '', focus: false },
    { key: 'loginPassword', placeholder: '', focus: false, type: "password" }
  ];
  pageLoaded!: Promise<boolean>;
  reloadNeeded: boolean = false;

  loginForm: FormGroup = new FormGroup({
    loginEmail: new FormControl('', [Validators.required, Validators.email]),
    loginPassword: new FormControl('', Validators.required)
  });

  publicContents: PublicContent[] = new Array();
  errorMessages: ErrorMessage[] = new Array();

  constructor(public dialogRef: MatDialogRef<LoginComponent>,
    private dataService: DataService,
    private languageService: LanguageService,
    private sessionService: SessionService,
    private roleService: RoleService) { }
  //publikus tartalmak, hibaüzenetek meghívása
  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/login/public'),
      this.dataService.getAllData('/api/errorMessages/public')
    ]).subscribe(res => {
      this.publicContents = res[0];
      this.errorMessages = res[1];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        if (lang) {
          this.loginFormElements = this.loginFormElements.map(element => {
            element.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', element.key, 'PublicContentTranslations');
            return element;
          });

          this.loginTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'loginTitle', 'PublicContentTranslations');
          this.loginSubtitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'loginSubtitle', 'PublicContentTranslations');
          this.loginButtonText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'loginButton', 'PublicContentTranslations');

          this.passwordDoesntMatchtext = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'passwordDoesntMatch', 'ErrorMessageTranslations');
          this.missingUserText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'missingUser', 'ErrorMessageTranslations');
          this.requiredFieldErrorText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'requiredFieldErrorMessage', 'ErrorMessageTranslations');
          this.wrongEmailFormatErrorText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'wrongEmailFormat', 'ErrorMessageTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }
  //szükséges feliratkozások megszüntetése
  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }
  //hibaüzenetek eltüntetése
  closeErrorMessage() {
    this.isUserMissing = false;
    this.passwordDoesntMatch = false;
  }
  //ablak bezárása
  closeDialog() {
    this.dialogRef.close();
  }
  //bejelentkezés adatok elküldése ellenőrzés után
  login() {
    this.isUserClicked = true;
    this.isUserMissing = false;
    this.passwordDoesntMatch = false;
    if (this.loginForm.valid) {
      this.dataService.httpPostMethod('/api/auth/login/public', this.loginForm.value).subscribe(res => {
        if (res.error == 'userNotExist') {
          this.isUserMissing = true;
          return;
        }
        this.sessionService.setSession(res.token);
        this.reloadNeeded = true;
        this.roleService.nextRole(res.role);
        this.sessionService.nextUserData({ monogram: res.monogram, profilePicture: res.profilePicture })
        this.dialogRef.close();
      }, error => {
        if (error.status == 401) {
          this.passwordDoesntMatch = true;
        }
      });
    }
  }

}
