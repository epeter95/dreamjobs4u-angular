import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RoleService } from '../services/role.service';

@Injectable({
  providedIn: 'root'
})
export class EmployerRoleGuard implements CanActivate {

  constructor(private roleService: RoleService) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const url: string = state.url;
    return this.checkEmployerRole(url);
  }
  //munkáltatói szerepkör ellenőrzés gyermek routeoknál
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const url: string = state.url;
    return this.checkEmployerRole(url);
  }
  //munkáltatói szerepkör ellenőrzés
  checkEmployerRole(url: string) {
    if (this.roleService.getRole()) {
      const role = this.roleService.getRole();
      if (environment.employerRoles.includes(role!)) {
        return true;
      }
      return false;
    }
    return false;
  }

}
