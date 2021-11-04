import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { Job } from '../interfaces/job';
import { PublicContent } from '../interfaces/public-contents';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';

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

  constructor(private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private languageService: LanguageService) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params=>{
      let id = params.get('jobId');
      forkJoin([
        this.dataService.getOneData('/api/jobs/public/getJobById/'+id),
        this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/jobPage/public'),
      ]).subscribe(res=>{
        this.job = res[0];
        this.publicContents = res[1];
        this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
          if(lang){
            this.job.selectedTranslation = this.languageService.getTranslation(lang,this.job.JobTranslations);
  
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
            this.pageLoaded = Promise.resolve(true);
          }
        });
      });
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

}
