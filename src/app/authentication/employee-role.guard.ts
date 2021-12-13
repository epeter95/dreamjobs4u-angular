import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RoleService } from '../services/role.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeRoleGuard implements CanActivate {

  constructor(private roleService: RoleService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const url: string = state.url;
    return this.checkEmployeeRole(url);
  }
  //munkavállalói szerepkör ellenőrzés gyermek routeoknál
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const url: string = state.url;
    return this.checkEmployeeRole(url);
  }
  //munkavállalói szerepkör ellenőrzés
  checkEmployeeRole(url: string) {
    if (this.roleService.getRole()) {
      const role = this.roleService.getRole();
      if (environment.employeeRoles.includes(role!)) {
        return true;
      }
      return false;
    }
    return false;
  }

}
