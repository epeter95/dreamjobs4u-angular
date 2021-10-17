import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { Role } from 'src/app/interfaces/role';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-registration-dialog',
  templateUrl: './registration-dialog.component.html',
  styleUrls: ['./registration-dialog.component.scss']
})
export class RegistrationDialogComponent implements OnInit {

  isEmployee: boolean = false;
  isEmployer: boolean = false;

  roles: Role[] = new Array();
  isUserClicked: boolean = false;
  selectedRole!: Role;

  sendButtonText: string = '';
  regTitleText: string = '';
  regSubtitleText: string = '';

  registrationFormElements: FormElement[] = [
    { key: 'regFirstName', placeholder: '', focus: false },
    { key: 'regLastName', placeholder: '', focus: false },
    { key: 'regEmail', placeholder: '', focus: false },
    { key: 'regConfirmPassword', placeholder: '', focus: false, type: "password"},
    { key: 'regPassword', placeholder: '', focus: false , type: "password"}
  ]

  registrationForm: FormGroup = new FormGroup({
    regFirstName: new FormControl('', Validators.required),
    regLastName: new FormControl('', Validators.required),
    regEmail: new FormControl('', [Validators.required, Validators.email]),
    regConfirmPassword: new FormControl('', Validators.required),
    regPassword: new FormControl('', Validators.required)
  });

  constructor(private dialogRef: MatDialogRef<RegistrationDialogComponent>, private dataService: DataService, private languageService: LanguageService) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/roles/public'),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/registration/public')
    ]).subscribe(res=>{
      this.roles = res[0];
      this.languageService.languageObservable$.subscribe(lang=>{
        this.roles = this.roles.map(element=>{
          element.selectedTranslation = this.languageService.getTranslation(lang,element.RoleTranslations);
          return element;
        });
        this.registrationFormElements = this.registrationFormElements.map(element=>{
          element.placeholder = this.languageService.getTranslationByKey(lang,res[1],'title',element.key,'PublicContentTranslations');
          return element;
        });
        this.sendButtonText = this.languageService.getTranslationByKey(lang,res[1],'title','regSubmitButton','PublicContentTranslations');
        this.regTitleText = this.languageService.getTranslationByKey(lang,res[1],'title','regTitle','PublicContentTranslations');
        this.regSubtitleText = this.languageService.getTranslationByKey(lang,res[1],'title','regSubtitle','PublicContentTranslations');
      });
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  setRoleActive(role: Role) {
    this.selectedRole = role;
    this.roles = this.roles.map(element=>{
      element == role ? element.isRoleSelected = true : element.isRoleSelected = false;
      return element;
    });
  }

  register() {
    console.log("submit");
  }

}
