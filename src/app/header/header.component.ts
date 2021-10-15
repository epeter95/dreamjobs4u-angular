import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { RegistrationDialogComponent } from '../authentication/registration-dialog/registration-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isRegistrationOpen: boolean = false;
  registrationDialogSubscription: Subscription = new Subscription();
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openRegistrationDialog(){
    this.isRegistrationOpen = true;
    const registrationDialogRef = this.dialog.open(RegistrationDialogComponent,{
      backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel'
    });
    this.registrationDialogSubscription = registrationDialogRef.afterClosed().subscribe(()=>{
      this.isRegistrationOpen = false;
    });
  }

  ngOnDestroy(){
    this.registrationDialogSubscription.unsubscribe();
  }

}
