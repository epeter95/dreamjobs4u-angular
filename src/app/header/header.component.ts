import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { LoginComponent } from '../authentication/login/login.component';
import { RegistrationDialogComponent } from '../authentication/registration-dialog/registration-dialog.component';
import { RegistrationDoneDialog } from '../authentication/registration-done-dialog/registration-done-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isRegistrationOpen: boolean = false;
  isLoginOpen: boolean = false;
  registrationDialogSubscription: Subscription = new Subscription();
  registrationDoneDialogSubscription: Subscription = new Subscription();
  loginDialogSubscription: Subscription = new Subscription();
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openRegistrationDialog(){
    this.isRegistrationOpen = true;
    const registrationDialogRef = this.dialog.open(RegistrationDialogComponent,{
      backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
      disableClose: true
    });
    this.registrationDialogSubscription = registrationDialogRef.afterClosed().subscribe(()=>{
      this.isRegistrationOpen = false;
      if(registrationDialogRef.componentInstance.isRegistrationSuccess){
        const registrationDoneDialogRef = this.dialog.open(RegistrationDoneDialog,{
          backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
          disableClose: true
        });
        this.registrationDoneDialogSubscription = registrationDoneDialogRef.afterClosed().subscribe(()=>{
          if(registrationDoneDialogRef.componentInstance.openLoginNeeded){
            this.openLoginDialog();
          }
        });
      }
    });
  }

  openLoginDialog(){
    this.isLoginOpen = true;
    const loginDialogRef = this.dialog.open(LoginComponent,{
      backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
      disableClose: true
    });
    this.loginDialogSubscription = loginDialogRef.afterClosed().subscribe(()=>{
      this.isLoginOpen = false;
    });
  }

  ngOnDestroy(){
    this.registrationDialogSubscription.unsubscribe();
    this.registrationDoneDialogSubscription.unsubscribe();
  }

}
