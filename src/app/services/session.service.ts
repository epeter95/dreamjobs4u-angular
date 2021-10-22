import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }

  getSession(){
    return localStorage.getItem('user-token');
  }

  setSession(token: string){
    localStorage.setItem('user-token',token);
  }
}
