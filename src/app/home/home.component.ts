import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { Category } from '../interfaces/category';
import { FormElement } from '../interfaces/form-element';
import { Job } from '../interfaces/job';
import { PublicContent } from '../interfaces/public-contents';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  searchTermElement: FormElement = {
    key: 'homeTextSearchTerm', placeholder: '', focus: false,
  };

  categoriesDropDown: FormElement = {
    key: 'homeCategorySearchTerm', placeholder: '', focus: false,
  };

  searchTitleText: string = '';
  searchSubtitleText: string = '';
  searchSubmitButtonText: string = '';

  categoryTitleText: string = '';
  categorySubtitleText: string = '';
  categoryJobCountText: string = '';
  allCategoryButtonText: string = '';

  registrationTitleText: string = '';
  registrationSubtitleText: string = '';
  registrationButtonText: string = '';
  profileTitleText: string = '';
  profileSubtitleText: string = '';
  profileButtonText: string = '';

  jobsTitleText: string = '';
  jobsSubtitleText: string = '';
  allJobButtonText: string = '';

  pageLoaded!: Promise<boolean>;
  jobs: Job[] = new Array();
  categories: Category[] = new Array();
  publicContents: PublicContent[] = new Array();
  languageSubscription: Subscription = new Subscription();
  homeCategories: Category[] = new Array();

  constructor(private dataService: DataService,
    private languageService: LanguageService) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/categories/public'),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/home/public'),
      this.dataService.getAllData('/api/jobs/public')
    ]).subscribe(res=>{
      this.categories = res[0];
      this.homeCategories = res[0];
      this.publicContents = res[1];
      this.jobs = (res[2] as Job[]).filter(element=>element.showOnMainPage);
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.categories = this.categories.map((element: Category)=>{
            element.selectedTranslation = this.languageService.getTranslation(lang, element.CategoryTranslations);
            return element;
          });
          this.homeCategories = this.homeCategories.map(element=>{
            element.selectedTranslation = this.languageService.getTranslation(lang, element.CategoryTranslations);
            return element;
          }).sort((a,b)=>{
            return b.Jobs.length - a.Jobs.length;
          })
          this.jobs = this.jobs.map(element=>{
            element.selectedTranslation = this.languageService.getTranslation(lang, element.JobTranslations);
            element.Category.selectedTranslation = this.languageService.getTranslation(lang, element.Category.CategoryTranslations);
            return element;
          });
          this.searchTermElement.placeholder = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeTextSearchTerm','PublicContentTranslations');
          this.categoriesDropDown.placeholder = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeCategorySearchTerm','PublicContentTranslations');
          this.searchTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeSearchTitle','PublicContentTranslations');
          this.searchSubtitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeSearchSubtitle','PublicContentTranslations');
          this.searchSubmitButtonText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeSearchSubmitButtonText','PublicContentTranslations');
          
          this.categoryTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeCategoryTitleText','PublicContentTranslations');
          this.categorySubtitleText = this.jobs.length +' '+ this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeCategorySubtitleText','PublicContentTranslations');
          this.categoryJobCountText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeCategoryJobCountText','PublicContentTranslations');
          this.allCategoryButtonText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeAllCategoryButtonText','PublicContentTranslations'); 
          
          this.registrationTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeRegistrationTitleText','PublicContentTranslations');
          this.registrationSubtitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeRegistrationSubtitleText','PublicContentTranslations');
          this.registrationButtonText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeRegistrationButtonText','PublicContentTranslations');
          this.profileTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeProfileTitleText','PublicContentTranslations');
          this.profileSubtitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeProfileSubtitleText','PublicContentTranslations');
          this.profileButtonText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeProfileButtonText','PublicContentTranslations');
          
          this.jobsTitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeJobsTitleText','PublicContentTranslations');
          this.jobsSubtitleText = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeJobsSubtitleText','PublicContentTranslations');
          this.allJobButtonText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','homeJobsAllJobButtonText', 'PublicContentTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

}
