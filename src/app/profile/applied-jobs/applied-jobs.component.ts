import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { AppliedUserJob } from 'src/app/interfaces/job';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-applied-jobs',
  templateUrl: './applied-jobs.component.html',
  styleUrls: ['./applied-jobs.component.scss']
})
export class AppliedJobsComponent implements OnInit, OnDestroy {
  pageLoaded!: Promise<boolean>;
  appliedJobsTitleText: string = '';
  appliedJobsSubtitleText: string = '';
  publicContents: PublicContent[] = new Array();
  appliedJobs: AppliedUserJob[] = new Array();
  languageSubscription: Subscription = new Subscription();
  constructor(private dataService: DataService, private languageService: LanguageService,) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public'),
      this.dataService.getAllData('/api/jobs/public/getAppliedJobsByToken', this.dataService.getAuthHeader())
    ]).subscribe(res=>{
      this.publicContents = res[0];
      this.appliedJobs = res[1];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.appliedJobsTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileAppliedJobTitleText', 'PublicContentTranslations');
          this.appliedJobsSubtitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileAppliedJobSubtitleText', 'PublicContentTranslations');
          this.appliedJobs = this.appliedJobs.map(element=>{
            element.Job.selectedTranslation = this.languageService.getTranslation(lang, element.Job.JobTranslations);
            element.Job.Category.selectedTranslation = this.languageService.getTranslation(lang, element.Job.Category.CategoryTranslations);
            element.AppliedUserStatus.selectedTranslation = this.languageService.getTranslation(lang, element.AppliedUserStatus.AppliedUserStatusTranslations);
            return element;
          })
          this.pageLoaded = Promise.resolve(true);
        }
      })
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

}
