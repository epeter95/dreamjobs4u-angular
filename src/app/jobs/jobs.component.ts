import { Component, OnInit } from '@angular/core';
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
export class JobsComponent implements OnInit {
  jobs: Job[] = new Array();
  filteredJobs: Job[] = new Array();
  jobsTitleText: string = '';
  jobsSubtitleText: string = '';
  searchButtonText: string = '';
  publicContents: PublicContent[] = new Array();
  languageSubscription: Subscription = new Subscription();
  isCategoryDropdownOpen: boolean = false;
  pageLoaded!: Promise<boolean>;
  onFirstLoad: boolean = true;
  fromSearch: boolean = false;
  isUserLoggedIn: boolean = false;

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
      if (res[3]) {
        console.log(res[3]);
        this.preferredCategories = res[3].Categories;
        if (this.preferredCategories.length > 0) {
          this.jobs = this.jobs.sort((a, b) => {
            if (this.preferredCategories.find(element => a.Category.id == element.id)) return -1;
            if (this.preferredCategories.find(element => b.Category.id == element.id)) return 1;
            return 0;
          });
        }
      }
      this.activatedRoute.queryParamMap.subscribe(params => {
        if (params.get('text')) {
          this.searchForm.controls.jobTextSearchTerm.setValue(params.get('text'))
        }
        if (params.get('category')) {
          let selectedCategory = this.categories.find(element => element.id == +params.get('category')!)!;
          selectedCategory.selectedTranslation = this.languageService.getTranslation(this.languageService.getLangauge()!, selectedCategory.CategoryTranslations);
          this.searchForm.controls.jobCategorySearchTerm.setValue(selectedCategory.selectedTranslation.text);
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
          this.filterJobs();
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

  initData() {

  }

  setSelectedCategory(category: Category) {
    this.searchForm.controls.jobCategorySearchTerm.setValue(category.selectedTranslation.text);
    this.isCategoryDropdownOpen = false;
  }

  openCategory() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  filterJobs() {
    const searchTerm = this.searchForm.controls.jobTextSearchTerm.value;
    const jobCategorySearchTerm = this.searchForm.controls.jobCategorySearchTerm.value;
    this.filteredJobs = this.jobs;
    if (searchTerm || jobCategorySearchTerm) {
      const category = this.categories.find(element => element.selectedTranslation.text == jobCategorySearchTerm);
      this.filteredJobs = this.jobs.filter(element => {
        if (category && category.key != 'allCategory') {
          return (element.categoryId == category?.id && JSON.stringify(element.JobTranslations).toLowerCase().includes(searchTerm));
        }
        return (JSON.stringify(element.JobTranslations).toLowerCase().includes(searchTerm));
      });
    }
    this.router.navigate(['/allasok']);
  }

}
