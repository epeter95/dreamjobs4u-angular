import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  //szerepkörökhöz tartozó observablek, és kezelő metódusaik beállítása
  private roleSubject: Subject<string> = new BehaviorSubject<string>(this.initUserRole()!);
  roleObservable$ = this.roleSubject.asObservable();

  constructor(private router: Router) {}

  getRole(){
    return localStorage.getItem('swjbs-ur');
  }

  nextRole(role: string){
    this.setRole(role);
    this.roleSubject.next(role);
  }

  setRole(role: string){
    localStorage.setItem('swjbs-ur',role);
  }

  clearRole(){
    this.nextRole('');
    localStorage.removeItem('swjbs-ur');
    if(this.router.url.includes('/profil')){
      this.router.navigate(['/']);
    }
  }

  initUserRole(){
    return this.getRole() ? this.getRole() : '';
  }

  checkEmployeeRole(role: string){
    if(environment.employeeRoles.includes(role)){
      return true;
    }
    return false;
  }

  checkEmployerRole(role: string){
    if(environment.employerRoles.includes(role)){
      return true;
    }
    return false;
  }

}
