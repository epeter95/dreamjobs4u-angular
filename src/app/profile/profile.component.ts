import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserProfileData } from '../interfaces/user-data';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  monogram: string = '';
  profileData!: UserProfileData;
  constructor(private dataService: DataService,
    private languageService: LanguageService,
    private sessionService: SessionService) { }

  ngOnInit(): void {
    let headers = new HttpHeaders().set("Authorization", 'Bearer ' + this.sessionService.getSession());
    this.dataService.getOneData('/api/profiles/getProfileDataForPublic',headers).subscribe(res=>{
      console.log(res);
      this.profileData = res;
      this.monogram = res.firstName[0]+res.lastName[0];
    });
  }

}
