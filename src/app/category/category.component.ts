import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Job } from '../interfaces/job';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, OnDestroy {
  categoryId: string = '';
  jobs: Job[] = new Array();
  languageSubscription: Subscription = new Subscription();


  constructor(private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private languageService: LanguageService) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params=>{
      if(params.get('categoryId')){
        this.categoryId = params.get('categoryId')!;
        this.dataService.getAllData('/api/jobs/public/getJobsByCategoryId/'+this.categoryId).subscribe(res=>{
          this.jobs = res;
          this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
            this.jobs = this.jobs.map(element=>{
              element.selectedTranslation = this.languageService.getTranslation(lang, element.JobTranslations);
              element.Category.selectedTranslation = this.languageService.getTranslation(lang, element.Category.CategoryTranslations);
              return element;
            })
          })
        });
      }
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

}
