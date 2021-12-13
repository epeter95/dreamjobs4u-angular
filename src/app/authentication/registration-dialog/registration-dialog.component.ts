import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { ErrorMessage } from 'src/app/interfaces/error-message';
import { FormElement } from 'src/app/interfaces/form-element';
import { GeneralMessage } from 'src/app/interfaces/general-message';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { Role } from 'src/app/interfaces/role';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-registration-dialog',
  templateUrl: './registration-dialog.component.html',
  styleUrls: ['./registration-dialog.component.scss']
})
export class RegistrationDialogComponent implements OnInit, OnDestroy {

  isEmployee: boolean = false;
  isEmployer: boolean = false;

  roles: Role[] = new Array();
  publicContents: PublicContent[] = new Array();
  errorMessages: ErrorMessage[] = new Array();
  isUserClicked: boolean = false;
  selectedRole!: Role;
  pageLoaded!: Promise<boolean>;

  sendButtonText: string = '';
  regTitleText: string = '';
  regSubtitleText: string = '';
  requiredFieldErrorText: string = '';
  wrongEmailFormatErrorText: string = '';
  emailAlreadyExistErrorText: string = '';
  passwordMismatchErrorText: string = '';
  missingRoleErrorText: string = '';

  isRoleMissing: boolean = false;
  isPasswordMismatch: boolean = false;
  isEmailAlreadyExist: boolean = false;
  isRegistrationSuccess: boolean = false;

  languageSubscription: Subscription = new Subscription();

  //regisztrációs formhoz szükséges elemek deklarálása
  registrationFormElements: FormElement[] = [
    { key: 'regFirstName', placeholder: '', focus: false },
    { key: 'regLastName', placeholder: '', focus: false },
    { key: 'regEmail', placeholder: '', focus: false },
    { key: 'regPassword', placeholder: '', focus: false, type: "password" },
    { key: 'regConfirmPassword', placeholder: '', focus: false, type: "password" }
  ]
  //regisztrációs form deklarálása
  registrationForm: FormGroup = new FormGroup({
    regFirstName: new FormControl('', Validators.required),
    regLastName: new FormControl('', Validators.required),
    regEmail: new FormControl('', [Validators.required, Validators.email]),
    regConfirmPassword: new FormControl('', Validators.required),
    regPassword: new FormControl('', Validators.required),
    privacy: new FormControl('', Validators.requiredTrue)
  });

  constructor(private dialogRef: MatDialogRef<RegistrationDialogComponent>,
    private dataService: DataService, private languageService: LanguageService) { }
  //publikus tartalmak, error messagek és szerepkörök meghívása, fordítások beállítása
  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/roles/public'),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/registration/public'),
      this.dataService.getAllData('/api/errorMessages/public')
    ]).subscribe(res => {
      this.roles = res[0];
      this.publicContents = res[1];
      this.errorMessages = res[2];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        if (lang) {
          this.roles = this.roles.map(element => {
            element.selectedTranslation = this.languageService.getTranslation(lang, element.RoleTranslations);
            return element;
          });
          this.registrationFormElements = this.registrationFormElements.map(element => {
            element.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', element.key, 'PublicContentTranslations');
            return element;
          });
          this.sendButtonText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'regSubmitButton', 'PublicContentTranslations');
          this.regTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'regTitle', 'PublicContentTranslations');
          this.regSubtitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'regSubtitle', 'PublicContentTranslations');
          this.requiredFieldErrorText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'requiredFieldErrorMessage', 'ErrorMessageTranslations');
          this.wrongEmailFormatErrorText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'wrongEmailFormat', 'ErrorMessageTranslations');
          this.emailAlreadyExistErrorText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'emailAddressAlreadyExist', 'ErrorMessageTranslations');
          this.passwordMismatchErrorText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'passwordMismatchConfirmPassword', 'ErrorMessageTranslations');
          this.missingRoleErrorText = this.languageService.getTranslationByKey(lang, this.errorMessages, 'text', 'missingRole', 'ErrorMessageTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }
  //dialógus ablak bezárása
  closeDialog() {
    this.dialogRef.close();
  }
  //hibaüzenetek eltüntetése
  closeErrorMessage() {
    this.isRoleMissing = false;
    this.isPasswordMismatch = false;
    this.isEmailAlreadyExist = false;
  }
  //active role kiválasztása
  setRoleActive(role: Role) {
    this.selectedRole = role;
    this.roles = this.roles.map(element => {
      element == role ? element.isRoleSelected = true : element.isRoleSelected = false;
      return element;
    });
  }
  //regisztrációs adatok elküldése ellenőrzés után
  register() {
    this.isUserClicked = true;
    if (this.registrationForm.valid) {
      this.isEmailAlreadyExist = false;
      this.isPasswordMismatch = false;
      this.isRoleMissing = false;
      if (!this.selectedRole) {
        this.isRoleMissing = true;
        return;
      }
      if (this.registrationForm.controls.regPassword.value != this.registrationForm.controls.regConfirmPassword.value) {
        this.isPasswordMismatch = true;
        return;
      }
      let result = {
        firstName: this.registrationForm.controls.regFirstName.value,
        lastName: this.registrationForm.controls.regLastName.value,
        email: this.registrationForm.controls.regEmail.value,
        password: this.registrationForm.controls.regPassword.value,
        roleId: this.selectedRole.id
      }
      this.dataService.httpPostMethod('/api/auth/register', result).subscribe(res => {
        if (res.error == 'SequelizeUniqueConstraintError') {
          this.isEmailAlreadyExist = true;
          return;
        } else if (res.error) {
          this.dialogRef.close();
        }
        this.isRegistrationSuccess = true;
        this.dialogRef.close();
      });
    }
  }

}
