import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { AppliedUser, Job, MyJob } from 'src/app/interfaces/job';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { ProfileDialogComponent } from 'src/app/profile-dialog/profile-dialog.component';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';
import { environment } from 'src/environments/environment';
import { AnswerToAppliedUserDialogComponent } from './answer-to-applied-user-dialog/answer-to-applied-user-dialog.component';

@Component({
  selector: 'app-my-jobs',
  templateUrl: './my-jobs.component.html',
  styleUrls: ['./my-jobs.component.scss']
})
export class MyJobsComponent implements OnInit, OnDestroy {
  myJobsTitleText: string = '';
  myJobs: MyJob[] = new Array();
  lang: string = '';
  languageSubscription: Subscription = new Subscription();
  publicContents: PublicContent[] = new Array();
  checkProfileText: string = '';
  sendAnswerText: string = '';
  statusText: string = '';
  pageLoaded!: Promise<boolean>;
  constructor(private dataService: DataService, private languageService: LanguageService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.initData();
  }
  private initData(){
    forkJoin([
      this.dataService.getAllData('/api/jobs/public/getJobsByTokenWithAppliedUsers', this.dataService.getAuthHeader()),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/employerJobs/public')
    ]).subscribe(res => {
      this.myJobs = res[0];
      this.publicContents = res[1];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        if(lang){
          this.lang = lang;
          this.myJobs = this.myJobs.map(element => {
            element.jobData.logoUrl = element.jobData.logoUrl;
            element.jobData.selectedTranslation = this.languageService.getTranslation(lang, element.jobData.JobTranslations);
            element.jobData.Category.selectedTranslation = this.languageService.getTranslation(lang, element.jobData.Category.CategoryTranslations);
            element.appliedUsers = element.appliedUsers.map(user=>{
              user.AppliedUserStatus.selectedTranslation = this.languageService.getTranslation(lang, user.AppliedUserStatus.AppliedUserStatusTranslations);
              return user;
            })
            return element;
          });
          this.myJobsTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'myJobsTitleText', 'PublicContentTranslations');
          this.sendAnswerText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'employerJobsAnswerText', 'PublicContentTranslations');
          this.statusText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'employerJobsStatusText', 'PublicContentTranslations');
          this.checkProfileText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'employerJobsCheckProfileText', 'PublicContentTranslations');
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

  openAnswerDialog(appliedUser: AppliedUser, job: MyJob){
    const ref = this.dialog.open(AnswerToAppliedUserDialogComponent,{
      data: {
        profile: appliedUser.User, status: appliedUser.AppliedUserStatus.id,
        lang: this.lang, jobName: job.jobData.selectedTranslation.title, jobCompany: job.jobData.companyName,
        jobId: job.jobData.id, userId: appliedUser.User.id
      },
      backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
      disableClose: true
    });
    ref.afterClosed().subscribe(()=>{
      this.initData();
      this.dialog.open(MessageDialogComponent,{
        data: {icon: 'done', text: 'Sikeres válasz küldése'},
        backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
        disableClose: true
      });
    })
  }

}
