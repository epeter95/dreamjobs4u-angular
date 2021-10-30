import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Job } from '../interfaces/job';
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

  constructor(private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private languageService: LanguageService) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params=>{
      let id = params.get('jobId');
      this.dataService.getOneData('/api/jobs/public/getJobById/'+id).subscribe(res=>{
        this.job = res;
        this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
          this.job.selectedTranslation = this.languageService.getTranslation(lang,this.job.JobTranslations);
        });
      });
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

}
