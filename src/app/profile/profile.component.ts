import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserProfileData } from '../interfaces/user-data';
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
  profileDataAndPublicContentSubscription: Subscription = new Subscription();
  jobTitle: string = '';

  constructor(private languageService: LanguageService,
    private profileService: ProfileService) { }

  ngOnInit(): void {

    this.profileService.getProfileDataAndPublicContents().subscribe(res=>{
      this.profileService.nextProfileData(res);
      this.initProfileData(res[0]);
    });

    this.profileDataAndPublicContentSubscription = this.profileService.refreshProfileDataObservable$.subscribe(refresh=>{
      if(refresh){
        this.profileDataSubscription = this.profileService.getProfileData().subscribe(res=>{
          this.initProfileData(res);
        });
      }
    })
  }

  ngOnDestroy(){
    this.profileDataSubscription.unsubscribe();
    this.profileDataAndPublicContentSubscription.unsubscribe();
  }

  initProfileData(res: any){
    this.profileData = res;
    this.monogram = res.firstName[0]+res.lastName[0];
    this.jobTitle = res.Profile.jobTitle;
  }

}
