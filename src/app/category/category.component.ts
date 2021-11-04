import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Job } from '../interfaces/job';
import { PublicContent } from '../interfaces/public-contents';
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
  mainLanguageSubscription: Subscription = new Subscription();
  publicContents: PublicContent[] = new Array();
  noCategoriesText: string = '';
  jobCountTitleText: string = '';
  pageLoaded!: Promise<boolean>;

  constructor(private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private languageService: LanguageService) { }

  ngOnInit(): void {
    this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/categoriesPage/public').subscribe(res=>{
      this.publicContents = res;
      this.mainLanguageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.noCategoriesText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','categoriesPageNoCategoriesText','PublicContentTranslations');
          this.jobCountTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','categoriesPageJobCountText','PublicContentTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      })
    });
    this.activatedRoute.paramMap.subscribe(params=>{
      if(params.get('categoryId')){
        this.categoryId = params.get('categoryId')!;
        this.dataService.getAllData('/api/jobs/public/getJobsByCategoryId/'+this.categoryId).subscribe(res=>{
          this.jobs = res;
          this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
            if(lang){
              this.jobs = this.jobs.map(element=>{
                element.selectedTranslation = this.languageService.getTranslation(lang, element.JobTranslations);
                element.Category.selectedTranslation = this.languageService.getTranslation(lang, element.Category.CategoryTranslations);
                return element;
              })
            }
          })
        });
      }
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
    this.mainLanguageSubscription.unsubscribe();
  }

}
