import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { Category } from 'src/app/interfaces/category';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
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
  userData!: UserProfileData;
  constructor(private dataService: DataService,
    private languageService: LanguageService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/categories/public'),
      this.dataService.getOneData('/api/users/getUserDataWithCategoriesForPublic',this.dataService.getAuthHeader())
    ]).subscribe(res=>{
      this.userData = res[1];
      this.languageService.languageObservable$.subscribe(lang=>{
        this.categories = res[0].map((element: Category)=>{
          element.selectedTranslation = this.languageService.getTranslation(lang, element.CategoryTranslations);
          return element;
        });
        if(this.userData.Categories.length > 0){
          this.selectedCategories = this.userData.Categories.map((element: Category)=>{
            element.selectedTranslation = this.languageService.getTranslation(lang,element.CategoryTranslations);
            return element;
          });
        }
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

