import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { LoginComponent } from 'src/app/authentication/login/login.component';
import { RegistrationDialogComponent } from 'src/app/authentication/registration-dialog/registration-dialog.component';
import { RegistrationDoneDialog } from 'src/app/authentication/registration-done-dialog/registration-done-dialog.component';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-home-register',
  templateUrl: './home-register.component.html',
  styleUrls: ['./home-register.component.scss']
})
export class HomeRegisterComponent implements OnInit, OnDestroy {
  registrationDialogSubscription: Subscription = new Subscription();
  registrationDoneDialogSubscription: Subscription = new Subscription();
  isUserLoggedIn: boolean = false;
  constructor(public dialog: MatDialog, private sessionService: SessionService) { }

  ngOnInit(): void {
    this.sessionService.userLoggedInObservable$.subscribe(state=>{
      this.isUserLoggedIn = state;
    })
  }

  ngOnDestroy(){
    this.registrationDialogSubscription.unsubscribe();
    this.registrationDoneDialogSubscription.unsubscribe();
  }

  openRegistrationDialog(){
    const registrationDialogRef = this.dialog.open(RegistrationDialogComponent, {
      backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
      disableClose: true
    });
    this.registrationDialogSubscription = registrationDialogRef.afterClosed().subscribe(() => {
      if (registrationDialogRef.componentInstance.isRegistrationSuccess) {
        const registrationDoneDialogRef = this.dialog.open(RegistrationDoneDialog, {
          backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
          disableClose: true
        });
        this.registrationDoneDialogSubscription = registrationDoneDialogRef.afterClosed().subscribe(() => {
          if (registrationDoneDialogRef.componentInstance.openLoginNeeded) {
            this.openLoginDialog();
          }
        });
      }
    });
  }

  openLoginDialog() {
    const loginDialogRef = this.dialog.open(LoginComponent, {
      backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
      disableClose: true
    });
  }
}

