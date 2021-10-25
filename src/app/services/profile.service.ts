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

  private profileDataSubject: Subject<Array<any>> = new BehaviorSubject<Array<any>>(new Array());
  profileDataObservable$ = this.profileDataSubject.asObservable();

  constructor(private dataService: DataService, private sessionService: SessionService) {}


  nextProfileData(data: any[]){
    this.profileDataSubject.next(data);
  }

  nextRefreshState(refresh: boolean){
    this.refreshProfileDataSubject.next(refresh);
  }

  getInfoForProfileComponents(){
    let headers = new HttpHeaders().set("Authorization", 'Bearer ' + this.sessionService.getSession());
    return forkJoin([
      this.dataService.getOneData('/api/profiles/getProfileDataForPublic',headers),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public'),
      this.dataService.getAllData('/api/generalMessages/public'),
      this.dataService.getAllData('/api/errorMessages/public')
    ]);
  }

  getProfileData(){
    let headers = new HttpHeaders().set("Authorization", 'Bearer ' + this.sessionService.getSession());
    return this.dataService.getOneData('/api/profiles/getProfileDataForPublic',headers);
  }
}
