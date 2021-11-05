import { HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { PublicContent } from 'src/app/interfaces/public-contents';
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
  languageSubscription: Subscription = new Subscription();
  succesfulBasicInfoText: string = '';
  publicContents: PublicContent[] = new Array();
  pageLoaded!: Promise<boolean>;
  isEmployerRole: boolean = false;
  isEmployeeRole: boolean = false;
  generalMessages: PublicContent[] = new Array();
  cvUrl: any = '';
  cvUploadUrl: any = '';
  cvChanging: boolean = false;
  fileData!: File | string;

  basicInfoFormElements: FormElement[] = [
    { key: 'profileFirstName', placeholder: '', focus: false, profileDataKey: 'firstName' },
    { key: 'profileLastName', placeholder: '', focus: false, profileDataKey: 'lastName' },
    { key: 'profileJobTitle', placeholder: '', focus: false, profileDataKey: 'jobTitle' },
    { key: 'profileAge', placeholder: '', focus: false, profileDataKey: 'age' },
    { key: 'profileCurrentSalary', placeholder: '', focus: false, profileDataKey: 'currentSalary', roleName: 'employee' },
    { key: 'profileExpectedSalary', placeholder: '', focus: false, profileDataKey: 'expectedSalary', roleName: 'employee' },
    { key: 'profileCv', placeholder: '', focus: false, profileDataKey: 'cvPath', fieldType: 'file', roleName: 'employee' },
    { key: 'profileDescription', placeholder: '', focus: false, fieldType: 'textarea', profileDataKey: 'description' }
  ];

  basicInfoForm: FormGroup = new FormGroup({
    profileFirstName: new FormControl(''),
    profileLastName: new FormControl(''),
    profileJobTitle: new FormControl(''),
    profileAge: new FormControl(''),
    profileCv: new FormControl(''),
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
    this.languageSubscription.unsubscribe();
  }

  initData() {
    forkJoin([
      this.dataService.getOneData('/api/profiles/getProfileDataForPublic',this.dataService.getAuthHeader()),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public'),
      this.dataService.getAllData('/api/generalMessages/public')
    ]).subscribe(res => {
        this.profileData = res[0];
        this.publicContents =res[1];
        this.generalMessages = res[2];
        console.log(this.profileData.Profile.cvPath.substr(this.profileData.Profile.cvPath.lastIndexOf("/") + 1));
        this.cvUrl = this.profileData.Profile.cvPath.substr(this.profileData.Profile.cvPath.lastIndexOf("/") + 1);
        this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
          if(lang){
            this.basicInfoTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileBasicInfoTitle', 'PublicContentTranslations');
            this.sendButtonText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileSendButtonText', 'PublicContentTranslations');
            this.basicInfoFormElements = this.basicInfoFormElements.map(element => {
              const attribute = element.profileDataKey ? element.profileDataKey : '';
              this.basicInfoForm.controls[element.key].setValue(res[0][attribute] ? res[0][attribute] : res[0]['Profile'][attribute]);
              element.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', element.key, 'PublicContentTranslations');
              element.value = res[0][attribute] ? res[0][attribute] : res[0]['Profile'][attribute]
              if(element.roleName == 'employee' && !this.isEmployeeRole){
                element.hide = true;
              }
              return element;
            });
            this.succesfulBasicInfoText = this.languageService.getTranslationByKey(lang, this.generalMessages, 'text', 'successfulProfileChange', 'GeneralMessageTranslations');
            this.pageLoaded = Promise.resolve(true);
          }
        });
    });
  }

  handleCVPdf(event: any){
    this.fileData = event.target.files[0] as File;
    console.log(event.target.files[0].name);
    this.cvUrl = this.fileData.name;
    this.basicInfoForm.controls.profileCv.setValue('value');
    this.cvChanging = true;
    const files = event.target.files;
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.cvUploadUrl = reader.result;
    }
  }

  saveInfos() {
    let userResult = {
      firstName: this.basicInfoForm.controls.profileFirstName.value,
      lastName: this.basicInfoForm.controls.profileLastName.value
    }
    let profileResult: any = {
      jobTitle: this.basicInfoForm.controls.profileJobTitle.value,
      age: this.basicInfoForm.controls.profileAge.value,
      currentSalary: this.basicInfoForm.controls.profileCurrentSalary.value,
      expectedSalary: this.basicInfoForm.controls.profileExpectedSalary.value,
      description: this.basicInfoForm.controls.profileDescription.value,
    }
    let profileFormData = new FormData();
    const attributes = Object.keys(profileResult);
    for (let i = 0; i < attributes.length; ++i) {
      profileFormData.append(attributes[i], profileResult[attributes[i]]);
    }
    if (this.cvChanging) {
      profileFormData.append('cvPath', this.fileData);
    }
    forkJoin([
      this.dataService.httpPostMethod('/api/users/public/modifyUserData', userResult, this.dataService.getAuthHeader()),
      this.dataService.httpPostMethod('/api/profiles/public/modifyProfileData', profileFormData, this.dataService.getAuthHeader())
    ]).subscribe(res => {
      this.cvChanging = false;
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
