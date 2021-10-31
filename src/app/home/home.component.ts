import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
    key: 'searchTerm', placeholder: '', focus: false,
  };

  categoriesDropDown: FormElement = {
    key: 'category', placeholder: '', focus: false,
  };

  categories: Category[] = new Array();
  isCategoryDropdownOpen: boolean = false;

  searchForm: FormGroup = new FormGroup({
    searchTerm: new FormControl(''),
    category: new FormControl(''),
  });
  constructor(private dataService: DataService,
    private languageService: LanguageService) { }

  ngOnInit(): void {
    this.dataService.getAllData('/api/categories/public').subscribe(res=>{
      this.languageService.languageObservable$.subscribe(lang=>{
        this.categories = res.map((element: Category)=>{
          element.selectedTranslation = this.languageService.getTranslation(lang, element.CategoryTranslations);
          return element;
        });
      });
    })
  }

  setSelectedCategory(category: Category){
    this.searchForm.controls.category.setValue(category.selectedTranslation.text);
    this.isCategoryDropdownOpen = false;
  }

  openCategory(){
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

}
