import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

export interface DialogData {
  icon: string;
  text: string;
  url?: string;
  urlText?: string;
  cancel?: boolean;
}

@Component({
  selector: 'app-registration-done-dialog',
  templateUrl: './registration-done-dialog.component.html',
  styleUrls: ['./registration-done-dialog.component.scss']
})
export class RegistrationDoneDialog implements OnInit {

  acceptance: boolean = false;
  openLoginNeeded: boolean = false;
  clickToLoginText: string = '';
  successfulRegistrationText: string = '';

  constructor(public dialogRef: MatDialogRef<RegistrationDoneDialog>,
    private dataService: DataService,
    private languageService: LanguageService) { }

  ngOnInit(): void {
    this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/registration/public').subscribe(res=>{
      this.languageService.languageObservable$.subscribe(lang=>{
        this.clickToLoginText = this.languageService.getTranslationByKey(lang,res,'title','clickToLoginLink','PublicContentTranslations');
        this.successfulRegistrationText = this.languageService.getTranslationByKey(lang,res,'title','successfulRegText','PublicContentTranslations');
      });
    });
  }

  openLogin(){
    this.openLoginNeeded = true;
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
