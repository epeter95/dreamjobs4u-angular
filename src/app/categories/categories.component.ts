import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Category } from '../interfaces/category';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = new Array();
  languageSubscription: Subscription = new Subscription();
  constructor( 
    private languageService: LanguageService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.getAllData('/api/categories/public').subscribe(res=>{
      this.categories = res;
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.categories = this.categories.map(element=>{
            element.selectedTranslation = this.languageService.getTranslation(lang,element.CategoryTranslations);
            return element;
          });
        }
      });
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

}
