import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { PublicContent } from '../interfaces/public-contents';
import { UserProfileData } from '../interfaces/user-data';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  monogram: string = '';
  profileData!: UserProfileData;
  profileDataSubscription: Subscription = new Subscription();
  languageSubscription: Subscription = new Subscription();
  profileDataAndPublicContentSubscription: Subscription = new Subscription();
  jobTitle: string = '';
  fileData!: File | string;
  isProfilePictureExists: boolean = false;
  profilePictureControl: FormControl = new FormControl('');
  isProfilePicChanging: boolean = false;
  basicInfoMenuText: string = '';
  contactInfoMenuText: string = '';
  changePasswordMenuText: string = '';
  preferedCategoriesText: string = '';
  imageUrl: any;
  pageLoaded!: Promise<boolean>;
  publicContents: PublicContent[] = new Array();

  constructor(private languageService: LanguageService,
    private dataService: DataService,
    private profileService: ProfileService) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getOneData('/api/profiles/getProfileDataForPublic', this.dataService.getAuthHeader()),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public')
    ]).subscribe(res => {
      this.initProfileData(res[0]);
      this.publicContents = res[1];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        if (lang) {
          this.basicInfoMenuText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileBasicInfoTitle', 'PublicContentTranslations');
          this.contactInfoMenuText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileContactTitle', 'PublicContentTranslations');
          this.preferedCategoriesText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profilePreferedCategoriesText', 'PublicContentTranslations');
          this.changePasswordMenuText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileChangePasswordTitle', 'PublicContentTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });

    this.profileDataAndPublicContentSubscription = this.profileService.refreshProfileDataObservable$.subscribe(refresh => {
      if (refresh) {
        this.profileDataSubscription = this.profileService.getProfileData().subscribe(res => {
          this.initProfileData(res);
        });
      }
    });
  }

  ngOnDestroy() {
    this.profileDataSubscription.unsubscribe();
    this.languageSubscription.unsubscribe();
    this.profileDataAndPublicContentSubscription.unsubscribe();
  }

  handleProfilePicture(event: any) {
    this.fileData = event.target.files[0] as File;
    const files = event.target.files;
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imageUrl = reader.result;
      this.isProfilePicChanging = true;
    }
  }

  initProfileData(res: any) {
    this.profileData = res;
    this.monogram = this.profileData.firstName[0] + this.profileData.lastName[0];
    this.imageUrl = this.profileData.Profile.profilePicture;
    this.jobTitle = this.profileData.Profile.jobTitle;
    if (this.profileData.Profile.profilePicture) {
      this.imageUrl = this.profileData.Profile.profilePicture;
    } else {
      this.imageUrl = '';
    }
  }

  saveProfilePicture() {
    let formData = new FormData();
    if (this.isProfilePicChanging) {
      formData.append('profilePictureUrl', this.fileData);
    }
    this.dataService.httpPostMethod('/api/profiles/public/editProfilePicture', formData, this.dataService.getAuthHeader()).subscribe(res => {
      this.isProfilePicChanging = false;
      this.profileService.nextRefreshState(true);
    });
  }

  removeProfilePicture() {
    this.imageUrl = '';
    this.isProfilePicChanging = true;
    this.profilePictureControl.setValue('');
    this.fileData = '';
  }

}

