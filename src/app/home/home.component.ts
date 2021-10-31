import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Category } from '../interfaces/category';
import { FormElement } from '../interfaces/form-element';
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

  isPageLoaded: boolean = false;

  categories: Category[] = new Array();

  constructor(private dataService: DataService,
    private languageService: LanguageService) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/categories/public'),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/home/public')
    ]).subscribe(res=>{
      this.languageService.languageObservable$.subscribe(lang=>{
        this.categories = res[0].map((element: Category)=>{
          element.selectedTranslation = this.languageService.getTranslation(lang, element.CategoryTranslations);
          return element;
        });
        this.searchTermElement.placeholder = this.languageService.getTranslationByKey(lang,res[1],'title','homeTextSearchTerm','PublicContentTranslations');
        this.categoriesDropDown.placeholder = this.languageService.getTranslationByKey(lang,res[1],'title','homeCategorySearchTerm','PublicContentTranslations');
        if(!this.isPageLoaded)this.isPageLoaded = true;
      });
    });
  }

}
