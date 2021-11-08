import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { AppliedUser, Job, MyJob } from 'src/app/interfaces/job';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { ProfileDialogComponent } from 'src/app/profile-dialog/profile-dialog.component';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-jobs',
  templateUrl: './my-jobs.component.html',
  styleUrls: ['./my-jobs.component.scss']
})
export class MyJobsComponent implements OnInit, OnDestroy {
  myJobsTitleText: string = '';
  myJobs: MyJob[] = new Array();
  languageSubscription: Subscription = new Subscription();
  publicContents: PublicContent[] = new Array();
  pageLoaded!: Promise<boolean>;
  constructor(private dataService: DataService, private languageService: LanguageService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/jobs/public/getJobsByTokenWithAppliedUsers', this.dataService.getAuthHeader()),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/employerJobs/public')
    ]).subscribe(res => {
      this.myJobs = res[0];
      this.publicContents = res[1];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        if(lang){
          this.myJobs = this.myJobs.map(element => {
            element.jobData.logoUrl = element.jobData.logoUrl;
            element.jobData.selectedTranslation = this.languageService.getTranslation(lang, element.jobData.JobTranslations);
            element.jobData.Category.selectedTranslation = this.languageService.getTranslation(lang, element.jobData.Category.CategoryTranslations);
            return element;
          });
          this.myJobsTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'myJobsTitleText', 'PublicContentTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

  openAppliedUsers(job: MyJob){
    job.isAppliedUsersOpen = !job.isAppliedUsersOpen
  }

  openProfileDialog(appliedUser: AppliedUser){
    this.dialog.open(ProfileDialogComponent,{
      data: appliedUser.User,
      backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
      disableClose: true
    });
  }

  openAnswerDialog(appliedUser: AppliedUser){

  }

}
