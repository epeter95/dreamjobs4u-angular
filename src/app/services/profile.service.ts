import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { UserProfileData } from '../interfaces/user-data';
import { DataService } from './data.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileDataSubject: Subject<UserProfileData> = new Subject<UserProfileData>();
  profileDataObservable$ = this.profileDataSubject.asObservable();

  constructor(private dataService: DataService, private sessionService: SessionService) {}

  nextProfileData(data: UserProfileData){
    this.profileDataSubject.next(data);
  }

  getProfileDataAndPublicContents(){
    let headers = new HttpHeaders().set("Authorization", 'Bearer ' + this.sessionService.getSession());
    return forkJoin([
      this.dataService.getOneData('/api/profiles/getProfileDataForPublic',headers),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public')
    ]);
  }
}
