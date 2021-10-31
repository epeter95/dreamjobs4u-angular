import { HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';
import { ProfileService } from 'src/app/services/profile.service';
import { RoleService } from 'src/app/services/role.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-basic-information',
  templateUrl: './basic-information.component.html',
  styleUrls: ['./basic-information.component.scss']
})
export class BasicInformationComponent implements OnInit, OnDestroy {
  basicInfoTitleText: string = '';
  sendButtonText: string = '';
  profileData!: UserProfileData;
  profileDataSubscription: Subscription = new Subscription();
  succesfulBasicInfoText: string = '';
  isEmployerRole: boolean = false;
  isEmployeeRole: boolean = false;

  basicInfoFormElements: FormElement[] = [
    { key: 'profileFirstName', placeholder: '', focus: false, profileDataKey: 'firstName' },
    { key: 'profileLastName', placeholder: '', focus: false, profileDataKey: 'lastName' },
    { key: 'profileJobTitle', placeholder: '', focus: false, profileDataKey: 'jobTitle' },
    { key: 'profileAge', placeholder: '', focus: false, profileDataKey: 'age' },
    { key: 'profileCurrentSalary', placeholder: '', focus: false, profileDataKey: 'currentSalary', roleName: 'employee' },
    { key: 'profileExpectedSalary', placeholder: '', focus: false, profileDataKey: 'expectedSalary', roleName: 'employee' },
    { key: 'profileDescription', placeholder: '', focus: false, fieldType: 'textarea', profileDataKey: 'description' }
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

  constructor(private dataService: DataService, private languageService: LanguageService,
    private profileService: ProfileService, private roleService: RoleService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.isEmployeeRole = this.roleService.checkEmployeeRole(this.roleService.getRole()!);
    this.isEmployerRole = this.roleService.checkEmployerRole(this.roleService.getRole()!);
    this.initData();
  }

  ngOnDestroy() {
    this.profileDataSubscription.unsubscribe();
  }

  initData() {
    this.profileDataSubscription = this.profileService.profileDataObservable$.subscribe(res => {
      if (res.length > 0) {
        this.profileData = res[0];
        this.languageService.languageObservable$.subscribe(lang => {
          this.basicInfoTitleText = this.languageService.getTranslationByKey(lang, res[1], 'title', 'profileBasicInfoTitle', 'PublicContentTranslations');
          this.sendButtonText = this.languageService.getTranslationByKey(lang, res[1], 'title', 'profileSendButtonText', 'PublicContentTranslations');
          this.basicInfoFormElements = this.basicInfoFormElements.map(element => {
            this.basicInfoForm.controls[element.key].setValue(res[0][element.profileDataKey!] ? res[0][element.profileDataKey!] : res[0]['Profile'][element.profileDataKey!]);
            element.placeholder = this.languageService.getTranslationByKey(lang, res[1], 'title', element.key, 'PublicContentTranslations');
            element.value = res[0][element.profileDataKey!] ? res[0][element.profileDataKey!] : res[0]['Profile'][element.profileDataKey!]
            if(element.roleName == 'employee' && !this.isEmployeeRole){
              element.hide = true;
            }
            return element;
          });
          this.succesfulBasicInfoText = this.languageService.getTranslationByKey(lang, res[2], 'text', 'successfulProfileChange', 'GeneralMessageTranslations');
        });
      }
    });
  }

  saveInfos() {
    let userResult = {
      firstName: this.basicInfoForm.controls.profileFirstName.value,
      lastName: this.basicInfoForm.controls.profileLastName.value
    }
    let profileResult = {
      jobTitle: this.basicInfoForm.controls.profileJobTitle.value,
      age: this.basicInfoForm.controls.profileAge.value,
      currentSalary: this.basicInfoForm.controls.profileCurrentSalary.value,
      expectedSalary: this.basicInfoForm.controls.profileExpectedSalary.value,
      description: this.basicInfoForm.controls.profileDescription.value
    }
    forkJoin([
      this.dataService.httpPostMethod('/api/users/public/modifyUserData', userResult, this.dataService.getAuthHeader()),
      this.dataService.httpPostMethod('/api/profiles/public/modifyProfileData', profileResult, this.dataService.getAuthHeader())
    ]).subscribe(res => {
      if (res[0].error || res[1].error) {
        this.dialog.open(MessageDialogComponent, {
          data: { icon: 'warning', text: 'asd' },
          backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
        });
        return;
      }
      const ref = this.dialog.open(MessageDialogComponent, {
        data: { icon: 'done', text: this.succesfulBasicInfoText },
        backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
        disableClose: true
      });
      ref.afterClosed().subscribe(() => {
        this.profileService.nextRefreshState(true);
      });
    });
  }

}
