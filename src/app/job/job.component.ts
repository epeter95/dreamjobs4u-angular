import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { forkJoin, Subscription } from 'rxjs';
import { ErrorMessage } from '../interfaces/error-message';
import { GeneralMessage } from '../interfaces/general-message';
import { Job } from '../interfaces/job';
import { PublicContent } from '../interfaces/public-contents';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { RoleService } from '../services/role.service';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit, OnDestroy {
  job!: Job;
  languageSubscription: Subscription = new Subscription();
  aboutUsText: string = '';
  jobDescriptionText: string = '';
  applyJobButtonText: string = '';
  jobOverviewText: string = '';
  paymentText: string = '';
  jobTypeText: string = '';
  experienceText: string = '';
  qualificationText: string = '';
  languageText: string = '';
  pageLoaded !: Promise<boolean>;
  publicContents: PublicContent[] = new Array();
  isEmployeeRole: boolean = false;
  isEmployerRole: boolean = false;
  errorMessages: ErrorMessage[] = new Array();
  generalMessages: GeneralMessage[] = new Array();
  userSuccessfullyRemovedFromJobText: string = '';
  successfulApplyToJobText: string = '';
  isUserAlreadyAppliedToJob: string = '';
  fbUrl: string = 'https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&layout=button_count&size=small&width=95&height=20&appId';


  constructor(private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private languageService: LanguageService,
    private roleService: RoleService,
    public dialog: MatDialog) { }
  //szükséges szerepkör lekérdezése, facebook megosztás link beállítása, állás, publikus tartalmak, általános üzenetek
  //hibaüzenetek, felhasználó jelentkezett-e az állásra lekérdezése, fordítások beállítása
  ngOnInit(): void {
    this.isEmployeeRole = this.roleService.checkEmployeeRole(this.roleService.getRole()!);
    this.isEmployerRole = this.roleService.checkEmployerRole(this.roleService.getRole()!);
    this.activatedRoute.paramMap.subscribe(params => {
      let id = params.get('jobId');
      this.fbUrl = 'https://www.facebook.com/plugins/share_button.php?href=' + encodeURIComponent(environment.apiDomain + '/api/jobs/facebook/' + id) + '&layout=button_count&size=small&width=100&height=20&appId';
      forkJoin([
        this.dataService.getOneData('/api/jobs/public/getJobById/' + id),
        this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/jobPage/public'),
        this.dataService.getAllData('/api/generalMessages/public'),
        this.dataService.getAllData('/api/errorMessages/public'),
        this.dataService.getOneData('/api/jobs/public/isUserAppliedToJob/' + id, this.dataService.getAuthHeader())
      ]).subscribe(res => {
        this.job = res[0];
        this.publicContents = res[1];
        this.generalMessages = res[2];
        this.errorMessages = res[3];
        this.isUserAlreadyAppliedToJob = res[4].exist ? 'exist' : 'notExist';
        this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
          if (lang) {
            this.job.selectedTranslation = this.languageService.getTranslation(lang, this.job.JobTranslations);

            this.aboutUsText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobPageAboutCompanyText', 'PublicContentTranslations');
            this.jobDescriptionText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobPageAboutJobText', 'PublicContentTranslations');
            this.paymentText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobPagePayment', 'PublicContentTranslations');
            this.experienceText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobPageExperience', 'PublicContentTranslations');
            this.jobTypeText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobPageJobType', 'PublicContentTranslations');
            this.qualificationText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobPageQualification', 'PublicContentTranslations');
            this.languageText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobPageLanguage', 'PublicContentTranslations');
            this.applyJobButtonText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobPageApplyToJobButton', 'PublicContentTranslations');
            this.jobOverviewText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobPageJobOverviewText', 'PublicContentTranslations');
            this.applyJobButtonText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobPageApplyToJobButton', 'PublicContentTranslations');

            this.successfulApplyToJobText = this.languageService.getTranslationByKey(lang, this.generalMessages, 'text', 'successfulApplyToJobText', 'GeneralMessageTranslations');

            this.userSuccessfullyRemovedFromJobText = this.languageService.getTranslationByKey(lang, this.generalMessages, 'text', 'userSuccessfullyRemovedFromJobText', 'GeneralMessageTranslations');

            this.pageLoaded = Promise.resolve(true);
          }
        });
      });
    })
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }
  //felhasználó jelentkezése állásra
  applyToJob() {
    this.dataService.httpPostMethod('/api/jobs/public/userApplyToJob', { jobId: this.job.id }, this.dataService.getAuthHeader()).subscribe(res => {
      this.dialog.open(MessageDialogComponent, {
        data: { icon: 'done', text: this.successfulApplyToJobText },
        backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
        disableClose: true
      });
      this.isUserAlreadyAppliedToJob = 'exist';
    });
  }
  //felhasználó jelentkezésének visszamondása állásról
  removeFromJob() {
    this.dataService.httpPostMethod('/api/jobs/public/userRemoveFromJob', { jobId: this.job.id }, this.dataService.getAuthHeader()).subscribe(res => {
      this.dialog.open(MessageDialogComponent, {
        data: { icon: 'done', text: this.userSuccessfullyRemovedFromJobText },
        backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
        disableClose: true
      });
      this.isUserAlreadyAppliedToJob = 'notExist';
    });
  }

}
