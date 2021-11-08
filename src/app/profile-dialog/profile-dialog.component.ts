import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PublicContent } from '../interfaces/public-contents';
import { UserProfileData } from '../interfaces/user-data';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent implements OnInit, OnDestroy {
  cvName: string = '';
  publicContents: PublicContent[] = new Array();
  emailLabelText: string = '';
  locationLabelText: string = '';
  phoneLabelText: string = '';
  descriptionLabelText: string = '';
  currentSalaryLabelText: string = '';
  expectedSalaryLabelText: string = '';
  languageSubscription: Subscription = new Subscription();
  pageLoaded!:Promise<boolean>;
  constructor(private dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserProfileData,
    private languageService: LanguageService,
    private dataService: DataService) { }

  ngOnInit(): void {
    if(this.data.Profile.cvPath)
    console.log(this.data);
    this.cvName = this.data.Profile.cvPath.substr(this.data.Profile.cvPath.lastIndexOf('/')+1);
    this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public').subscribe(res=>{
      this.publicContents = res;
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        this.emailLabelText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileEmailText', 'PublicContentTranslations');
        this.locationLabelText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileLocationText', 'PublicContentTranslations');
        this.phoneLabelText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profilePhone', 'PublicContentTranslations');
        this.descriptionLabelText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileDescription', 'PublicContentTranslations');
        this.currentSalaryLabelText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileCurrentSalary', 'PublicContentTranslations');
        this.expectedSalaryLabelText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileExpectedSalary', 'PublicContentTranslations');

        this.pageLoaded = Promise.resolve(true);
      });
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

  closeDialog(){
    this.dialogRef.close();
  }

}
