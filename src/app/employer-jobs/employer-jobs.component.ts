import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PublicContent } from '../interfaces/public-contents';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-employer-jobs',
  templateUrl: './employer-jobs.component.html',
  styleUrls: ['./employer-jobs.component.scss']
})
export class EmployerJobsComponent implements OnInit, OnDestroy {
  pageLoaded!: Promise<boolean>;
  languageSubscription: Subscription = new Subscription();
  publicContents: PublicContent[] = new Array();
  myJobsTitleText: string = '';
  creatingJobTitleText: string = '';
  modifyJobTitleText: string = '';
  eventsTitleText: string = '';

  constructor(private dataService: DataService, private languageService: LanguageService) { }

  ngOnInit(): void {
    this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/employerJobs/public').subscribe(res=>{
      this.publicContents = res;
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        if(lang){
          this.myJobsTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'myJobsTitleText', 'PublicContentTranslations');
          this.creatingJobTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'createJobTitle', 'PublicContentTranslations');
          this.modifyJobTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'modifyJobTitle', 'PublicContentTranslations');
          this.eventsTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'employerJobsEventsTitle', 'PublicContentTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

}
