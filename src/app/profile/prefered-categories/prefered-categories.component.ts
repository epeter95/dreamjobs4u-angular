import { Component, OnInit } from '@angular/core';
import { Category } from 'src/app/interfaces/category';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-prefered-categories',
  templateUrl: './prefered-categories.component.html',
  styleUrls: ['./prefered-categories.component.scss']
})
export class PreferedCategoriesComponent implements OnInit {
  selectedCategories: Category[] = new Array();
  categories: Category[] = new Array();
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
    });
  }

  removeCategory(category: Category){
    const index = this.selectedCategories.indexOf(category, 0);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    }
  }

  addOrRemoveCategory(category: Category){
    if (!this.selectedCategories.includes(category)) {
      this.selectedCategories.push(category);
    } else {
      this.removeCategory(category);
    }
  }

  saveCategories(){

  }

}
