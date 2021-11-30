import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { unAccentise } from '../interfaces/accentise';
import { Category } from '../interfaces/category';
import { FormElement } from '../interfaces/form-element';
import { Job } from '../interfaces/job';
import { PublicContent } from '../interfaces/public-contents';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit, OnDestroy {
  jobs: Job[] = new Array();
  filteredJobs: Job[] = new Array();
  jobsTitleText: string = '';
  jobsSubtitleText: string = '';
  searchButtonText: string = '';
  publicContents: PublicContent[] = new Array();
  languageSubscription: Subscription = new Subscription();
  activatedRouteSubscription: Subscription = new Subscription();
  isCategoryDropdownOpen: boolean = false;
  pageLoaded!: Promise<boolean>;
  onFirstLoad: boolean = true;
  fromSearch: boolean = false;
  isUserLoggedIn: boolean = false;
  jobCountInSelectedCategory: number = 0;

  searchTermElement: FormElement = {
    key: 'jobTextSearchTerm', placeholder: '', focus: false,
  };

  categoriesDropDown: FormElement = {
    key: 'jobCategorySearchTerm', placeholder: '', focus: false,
  };
  categories: Category[] = new Array();
  preferredCategories: Category[] = new Array();
  searchForm: FormGroup = new FormGroup({
    jobTextSearchTerm: new FormControl(''),
    jobCategorySearchTerm: new FormControl(''),
  });

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.languageSubscription.unsubscribe();
    this.activatedRouteSubscription.unsubscribe();
    this.initData();
  }


  constructor(private dataService: DataService,
    private languageService: LanguageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService) {
    if (this.sessionService.getSession()) {
      this.isUserLoggedIn = true;
    }
  }

  ngOnInit(): void {
    this.initData();
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
    this.activatedRouteSubscription.unsubscribe();
  }

  initData() {
    let sources: Observable<any>[] = [
      this.dataService.getAllData('/api/jobs/public'),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/jobsPage/public'),
      this.dataService.getAllData('/api/categories/public'),
    ];
    if (this.isUserLoggedIn) {
      sources.push(this.dataService.getOneData('/api/users/public/preferredCategories', this.dataService.getAuthHeader()))
    }
    forkJoin(
      sources
    ).subscribe(res => {
      this.jobs = res[0];
      this.publicContents = res[1];
      this.categories = res[2];
      this.categories.map(element=>{
        this.jobCountInSelectedCategory+=element.Jobs.length;
      })
      if (res[3]) {
        this.preferredCategories = res[3].Categories;
        if (this.preferredCategories.length > 0) {
          this.jobs = this.jobs.sort((a, b) => {
            if (this.preferredCategories.find(element => a.Category.id == element.id)) return -1;
            if (this.preferredCategories.find(element => b.Category.id == element.id)) return 1;
            return 0;
          });
        }
      }
      this.activatedRouteSubscription = this.activatedRoute.queryParamMap.subscribe(params => {
        if (params.get('text')) {
          this.searchForm.controls.jobTextSearchTerm.setValue(params.get('text'))
        }
        if (params.get('category')) {
          let selectedCategory = this.categories.find(element => element.id == +params.get('category')!)!;
          selectedCategory.selectedTranslation = this.languageService.getTranslation(this.languageService.getLangauge()!, selectedCategory.CategoryTranslations);
          this.searchForm.controls.jobCategorySearchTerm.setValue(selectedCategory.selectedTranslation.text);
          this.jobCountInSelectedCategory = selectedCategory.Jobs.length;
        }else{
          let selectedCategory = this.categories.find(element => element.key == 'allCategory')!;
          selectedCategory.selectedTranslation = this.languageService.getTranslation(this.languageService.getLangauge()!, selectedCategory.CategoryTranslations);
          this.searchForm.controls.jobCategorySearchTerm.setValue(selectedCategory.selectedTranslation.text);
          this.categories.map(element=>{
            this.jobCountInSelectedCategory+=element.Jobs.length;
          });
        }
      })
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang => {
        this.jobs = this.jobs.map(element => {
          element.selectedTranslation = this.languageService.getTranslation(lang, element.JobTranslations);
          element.Category.selectedTranslation = this.languageService.getTranslation(lang, element.Category.CategoryTranslations);
          return element;
        });
        this.categories = this.categories.map(element => {
          element.selectedTranslation = this.languageService.getTranslation(lang, element.CategoryTranslations);
          return element;
        });
        this.categories = this.categories.sort((a: Category, b: Category) => {
          if (a.selectedTranslation && b.selectedTranslation && unAccentise(a.selectedTranslation!.text) < unAccentise(b.selectedTranslation!.text)) { return -1 }
          if (a.selectedTranslation && b.selectedTranslation && unAccentise(a.selectedTranslation!.text) > unAccentise(b.selectedTranslation!.text)) { return 1 }
          return 0;
        });
        this.filteredJobs = this.jobs;
        if (this.searchForm.controls.jobTextSearchTerm.value || this.searchForm.controls.jobCategorySearchTerm.value) {
          this.filterJobs(false);
        }
        this.searchTermElement.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobTextSearchTerm', 'PublicContentTranslations');
        this.categoriesDropDown.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobCategorySearchTerm', 'PublicContentTranslations');
        this.jobsTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobsPageTitle', 'PublicContentTranslations');
        this.jobsSubtitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobsPageSubtitle', 'PublicContentTranslations');
        this.searchButtonText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'jobsSearchButtonText', 'PublicContentTranslations');
        this.pageLoaded = Promise.resolve(true);
      });
    });
  }

  setSelectedCategory(category: Category) {
    this.searchForm.controls.jobCategorySearchTerm.setValue(category.selectedTranslation.text);
    this.isCategoryDropdownOpen = false;
  }

  openCategory() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  filterJobs(navigationNeeded: boolean) {
    const searchTerm = this.searchForm.controls.jobTextSearchTerm.value;
    const jobCategorySearchTerm = this.searchForm.controls.jobCategorySearchTerm.value;
    let queryParams: any = {};
    this.filteredJobs = this.jobs;
    if (searchTerm || jobCategorySearchTerm) {
      if(searchTerm){
        queryParams['text'] = searchTerm;
      }
      const category = this.categories.find(element => element.selectedTranslation.text == jobCategorySearchTerm);
      if(jobCategorySearchTerm){
        queryParams['category'] = category!.id;
      }
      if(category!.key == 'allCategory'){
        this.categories.map(element=>{
          this.jobCountInSelectedCategory+=element.Jobs.length;
        })
      }else{
        this.jobCountInSelectedCategory = category!.Jobs.length;
      }
      this.filteredJobs = this.jobs.filter(element => {
        if (category && category.key != 'allCategory') {
          return (element.categoryId == category?.id && JSON.stringify(element.JobTranslations).toLowerCase().includes(searchTerm));
        }
        return (JSON.stringify(element.JobTranslations).toLowerCase().includes(searchTerm));
      });
    }
    if(navigationNeeded){
      this.router.navigate(['/allasok'], {queryParams: queryParams ? queryParams : null});
    }
  }

}
