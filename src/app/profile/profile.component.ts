import { Component, OnInit } from '@angular/core';
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
  constructor(private languageService: LanguageService,
    private profileService: ProfileService) { }

  ngOnInit(): void {
    this.profileService.getProfileDataAndPublicContents().subscribe(res=>{
      this.profileData = res[0];
      this.monogram = res[0].firstName[0]+res[0].lastName[0];
    });
  }

}
