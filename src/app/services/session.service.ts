import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { UserData } from '../interfaces/user-data';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private userLoggedInSubject: Subject<boolean> = new BehaviorSubject<boolean>(this.initUserLoggedIn());
  userLoggedInObservable$ = this.userLoggedInSubject.asObservable();

  private userDataSubject: Subject<UserData> = new Subject<UserData>();
  userDataObservable$ = this.userDataSubject.asObservable();

  constructor() { }

  getSession(){
    return localStorage.getItem('user-token');
  }

  nextUserState(state: boolean){
    this.userLoggedInSubject.next(state);
  }

  nextUserData(data: UserData){
    this.userDataSubject.next(data);
  }

  setSession(token: string){
    localStorage.setItem('user-token',token);
    this.nextUserState(true);
  }

  clearSession(){
    localStorage.removeItem('user-token');
    this.nextUserState(false);
  }

  initUserLoggedIn(){
    return this.getSession() ? true : false;
  }
}
