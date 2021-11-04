import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { Category } from '../interfaces/category';
import { PublicContent } from '../interfaces/public-contents';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = new Array();
  publicContents: PublicContent[] = new Array();
  pageTitleText: string = '';
  pageSubtitleText: string = '';
  jobCountTitleText: string = '';
  languageSubscription: Subscription = new Subscription();
  pageLoaded!: Promise<boolean>;
  constructor( 
    private languageService: LanguageService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/categories/public'),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/categoriesPage/public')
    ]).subscribe(res=>{
      this.categories = res[0].filter(element=>element.key!='allCategory');
      this.publicContents = res[1];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.categories = this.categories.map(element=>{
            element.selectedTranslation = this.languageService.getTranslation(lang,element.CategoryTranslations);
            return element;
          });
          this.pageTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','categoriesPageTitle','PublicContentTranslations');
          this.pageSubtitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','categoriesPageSubtitle','PublicContentTranslations');
          this.jobCountTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','categoriesPageJobCountText','PublicContentTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

}
