import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-registration-done-dialog',
  templateUrl: './registration-done-dialog.component.html',
  styleUrls: ['./registration-done-dialog.component.scss']
})
export class RegistrationDoneDialog implements OnInit, OnDestroy {

  openLoginNeeded: boolean = false;
  clickToLoginText: string = '';
  successfulRegistrationText: string = '';
  languageSubscription: Subscription = new Subscription();
  publicContents: PublicContent[] = new Array();
  pageLoaded!: Promise<boolean>;

  constructor(public dialogRef: MatDialogRef<RegistrationDoneDialog>,
    private dataService: DataService,
    private languageService: LanguageService) { }
  //publikus tartalmak lekérdezése
  ngOnInit(): void {
    this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/registration/public').subscribe(res => {
      this.publicContents = res;
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        if (lang) {
          this.clickToLoginText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'clickToLoginLink', 'PublicContentTranslations');
          this.successfulRegistrationText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'successfulRegText', 'PublicContentTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }
  //szükséges feliratkozások megszüntetése
  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }
  //bejelentkezés dialógus megnyitásához szükséges
  openLogin() {
    this.openLoginNeeded = true;
    this.dialogRef.close();
  }
  //ablak bezárása
  closeDialog() {
    this.dialogRef.close();
  }

}
