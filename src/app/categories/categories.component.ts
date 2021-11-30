import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { Category } from '../interfaces/category';
import { PublicContent } from '../interfaces/public-contents';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = new Array();
  preferredCategories: Category[] = new Array();
  publicContents: PublicContent[] = new Array();
  pageTitleText: string = '';
  pageSubtitleText: string = '';
  jobCountTitleText: string = '';
  languageSubscription: Subscription = new Subscription();
  isUserLoggedIn: boolean = false;
  pageLoaded!: Promise<boolean>;
  preferredCategoriesTitleText: string = '';
  preferredCategoriesSubtitleText: string = '';
  constructor( 
    private languageService: LanguageService,
    private dataService: DataService,
    private sessionService: SessionService,
    private router: Router
  ) {
    this.isUserLoggedIn = this.sessionService.getSession() ? true : false;
  }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/categories/public'),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/categoriesPage/public'),
      this.dataService.getAllData('/api/users/public/preferredCategories', this.dataService.getAuthHeader())
    ]).subscribe(res=>{
      this.categories = res[0].filter((element: any)=>element.key!='allCategory');
      this.publicContents = res[1];
      if(!(res[2]as any).error){
        this.preferredCategories = (res[2] as any).Categories;
      }
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.categories = this.categories.map(element=>{
            element.selectedTranslation = this.languageService.getTranslation(lang,element.CategoryTranslations);
            return element;
          });
          if(!(res[2]as any).error){
            this.preferredCategories = this.preferredCategories.map(element=>{
              element.selectedTranslation = this.languageService.getTranslation(lang,element.CategoryTranslations);
              return element;
            });
          }
          this.pageTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','categoriesPageTitle','PublicContentTranslations');
          this.pageSubtitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','categoriesPageTitle','PublicContentTranslations');
          this.preferredCategoriesTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','categoriesPagePreferredCategoriesTitleText','PublicContentTranslations');
          this.preferredCategoriesSubtitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','categoriesPagePreferredCategoriesSubtitleText','PublicContentTranslations');
          this.jobCountTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','categoriesPageJobCountText','PublicContentTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

  navigateToCategory(category: Category){
    let queryParams: any = {};
    queryParams['category'] = category.id;
    this.router.navigate(['/allasok'], {queryParams: queryParams ? queryParams: null});
  }

}
