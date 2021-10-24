import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { UserProfileData } from '../interfaces/user-data';
import { DataService } from './data.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private refreshProfileDataSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);
  refreshProfileDataObservable$ = this.refreshProfileDataSubject.asObservable();

  constructor(private dataService: DataService, private sessionService: SessionService) {}

  nextRefreshState(refresh: boolean){
    this.refreshProfileDataSubject.next(refresh);
  }

  getProfileDataAndPublicContents(){
    let headers = new HttpHeaders().set("Authorization", 'Bearer ' + this.sessionService.getSession());
    return forkJoin([
      this.dataService.getOneData('/api/profiles/getProfileDataForPublic',headers),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public')
    ]);
  }

  getProfileData(){
    let headers = new HttpHeaders().set("Authorization", 'Bearer ' + this.sessionService.getSession());
    return this.dataService.getOneData('/api/profiles/getProfileDataForPublic',headers);
  }
}
