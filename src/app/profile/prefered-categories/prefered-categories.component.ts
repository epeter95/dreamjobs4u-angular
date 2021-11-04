import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { Category } from 'src/app/interfaces/category';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-prefered-categories',
  templateUrl: './prefered-categories.component.html',
  styleUrls: ['./prefered-categories.component.scss']
})
export class PreferedCategoriesComponent implements OnInit, OnDestroy {
  selectedCategories: Category[] = new Array();
  categories: Category[] = new Array();
  userData!: UserProfileData;
  allCategoryText: string = '';
  selectedCategoriesText: string = '';
  preferedCategoriesText: string = '';
  saveButtonText: string = '';
  publicContents: PublicContent[] = new Array();
  languageSubscription: Subscription = new Subscription();
  pageLoaded!: Promise<boolean>;

  constructor(private dataService: DataService,
    private languageService: LanguageService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/categories/public'),
      this.dataService.getOneData('/api/users/getUserDataWithCategoriesForPublic',this.dataService.getAuthHeader()),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/profile/public')
    ]).subscribe(res=>{
      this.userData = res[1];
      this.categories = res[0].filter((element: Category)=>element.key!='allCategory');
      this.publicContents = res[2];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(this.userData.Categories.length > 0){
          this.selectedCategories = this.userData.Categories.map((element: Category)=>{
            element.selectedTranslation = this.languageService.getTranslation(lang,element.CategoryTranslations);
            return element;
          });
        }

        this.categories = this.categories.map((element: Category)=>{
          element.selectedTranslation = this.languageService.getTranslation(lang, element.CategoryTranslations);
          return element;
        });
        
        this.saveButtonText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileSendButtonText', 'PublicContentTranslations');
        this.allCategoryText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileAllCategoriesText', 'PublicContentTranslations');
        this.selectedCategoriesText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profileSelectedCategoriesText', 'PublicContentTranslations');
        this.preferedCategoriesText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'profilePreferedCategoriesText', 'PublicContentTranslations');
        this.pageLoaded = Promise.resolve(true);
      });
    });
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

  checkCategoryIsSelected(category: Category){
    return this.selectedCategories.some(element=> element.id == category.id);
  }

  removeCategory(category: Category){
    let selectedCategory = this.selectedCategories.find(element=>element.id == category.id);
    const index = this.selectedCategories.indexOf(selectedCategory!, 0);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    }
  }

  addOrRemoveCategory(category: Category){
    let selectedCategory = this.selectedCategories.find(element=>element.id == category.id);
    const index = this.selectedCategories.indexOf(selectedCategory!, 0);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    }else{
      this.selectedCategories.push(category); 
    }
  }

  saveCategories(){
    this.dataService.httpPostMethod('/api/users/public/addUserCategories', {categories: this.selectedCategories}, this.dataService.getAuthHeader()).subscribe(res=>{
      if(!res.error){
        this.dialog.open(MessageDialogComponent, {
          data: {icon: 'done', text: 'Sikeres'},
          backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
          disableClose: true
        });
      }
    });
  }

}
function UserProfileData(arg0: any[], UserProfileData: any) {
  throw new Error('Function not implemented.');
}

