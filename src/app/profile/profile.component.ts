import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserProfileData } from '../interfaces/user-data';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { ProfileService } from '../services/profile.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  monogram: string = '';
  profileData!: UserProfileData;
  profileDataSubscription: Subscription = new Subscription();
  profileDataAndPublicContentSubscription: Subscription = new Subscription();
  jobTitle: string = '';
  fileData!: File | string;
  isProfilePictureExists: boolean = false;
  profilePictureControl: FormControl = new FormControl('');
  isProfilePicChanging: boolean = false;
  basicInfoMenuText: string = '';
  contactInfoMenuText: string = '';
  changePasswordMenuText: string = '';

  imageUrl: any;

  constructor(private languageService: LanguageService,
    private dataService: DataService,
    private profileService: ProfileService,
    private sessionService: SessionService) { }

  ngOnInit(): void {
    this.profileService.getInfoForProfileComponents().subscribe(res=>{
      this.profileService.nextProfileData(res);
      this.initProfileData(res[0]);
      this.languageService.languageObservable$.subscribe(lang => {
        this.basicInfoMenuText = this.languageService.getTranslationByKey(lang, res[1], 'title', 'profileBasicInfoTitle', 'PublicContentTranslations');
        this.contactInfoMenuText = this.languageService.getTranslationByKey(lang, res[1], 'title', 'profileContactTitle', 'PublicContentTranslations');
        this.changePasswordMenuText = this.languageService.getTranslationByKey(lang, res[1], 'title', 'profileChangePasswordTitle', 'PublicContentTranslations');
      });
    });

    this.profileDataAndPublicContentSubscription = this.profileService.refreshProfileDataObservable$.subscribe(refresh=>{
      if(refresh){
        this.profileDataSubscription = this.profileService.getProfileData().subscribe(res=>{
          this.initProfileData(res);
        });
      }
    });
  }

  ngOnDestroy(){
    this.profileDataSubscription.unsubscribe();
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

  initProfileData(res: any){
    this.profileData = res;
    this.monogram = this.profileData.firstName[0]+this.profileData.lastName[0];
    this.imageUrl = this.profileData.Profile.profilePicture;
    this.jobTitle = this.profileData.Profile.jobTitle;
    if(this.profileData.Profile.profilePicture){
      this.imageUrl = this.profileData.Profile.profilePicture;
    }else{
      this.imageUrl = '';
    }
  }

  saveProfilePicture(){
    let formData = new FormData();
    if (this.isProfilePicChanging) {
      formData.append('profilePictureUrl', this.fileData);
    }
    this.dataService.httpPostMethod('/api/profiles/public/editProfilePicture',formData,this.dataService.getAuthHeader()).subscribe(res=>{
      this.isProfilePicChanging = false;
      this.profileService.nextRefreshState(true);
    });
  } 

  removeProfilePicture(){
    this.imageUrl = '';
    this.isProfilePicChanging = true;
    this.profilePictureControl.setValue('');
    this.fileData = '';
  }

}
