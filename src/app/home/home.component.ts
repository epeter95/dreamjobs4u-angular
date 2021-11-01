import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
export class HomeComponent implements OnInit {
  searchTermElement: FormElement = {
    key: 'homeTextSearchTerm', placeholder: '', focus: false,
  };

  categoriesDropDown: FormElement = {
    key: 'homeCategorySearchTerm', placeholder: '', focus: false,
  };

  pageLoaded!: Promise<boolean>;
  jobs: Job[] = new Array();
  categories: Category[] = new Array();
  publicContents: PublicContent[] = new Array();

  constructor(private dataService: DataService,
    private languageService: LanguageService) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/categories/public'),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/home/public'),
      this.dataService.getAllData('/api/jobs/public')
    ]).subscribe(res=>{
      this.categories = res[0];
      this.publicContents = res[1];
      this.jobs = res[2];
      this.languageService.languageObservable$.subscribe(lang=>{
        this.categories = this.categories.map((element: Category)=>{
          element.selectedTranslation = this.languageService.getTranslation(lang, element.CategoryTranslations);
          return element;
        });
        this.jobs = this.jobs.map(element=>{
          element.selectedTranslation = this.languageService.getTranslation(lang, element.JobTranslations);
          element.Category.selectedTranslation = this.languageService.getTranslation(lang, element.Category.CategoryTranslations);
          return element;
        });
        this.searchTermElement.placeholder = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeTextSearchTerm','PublicContentTranslations');
        this.categoriesDropDown.placeholder = this.languageService.getTranslationByKey(lang,this.publicContents,'title','homeCategorySearchTerm','PublicContentTranslations');
        this.pageLoaded = Promise.resolve(true);
      });
    });
  }

}
