import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from 'src/app/interfaces/category';
import { FormElement } from 'src/app/interfaces/form-element';

@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.component.html',
  styleUrls: ['./home-search.component.scss']
})
export class HomeSearchComponent implements OnInit {
  
  @Input() searchTermElement!: FormElement;
  @Input() categoriesDropDown!: FormElement;
  @Input() categories!: Category[];
  @Input() titleText: string = '';
  @Input() subtitleText: string = '';
  @Input() submitButtonText: string = '';
  
  searchForm: FormGroup = new FormGroup({
    homeTextSearchTerm: new FormControl(''),
    homeCategorySearchTerm: new FormControl(''),
  });

  isCategoryDropdownOpen: boolean = false;
  //legördülő menükről való máshova kattintás kezelése
  constructor(private renderer: Renderer2, private router: Router) {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.categoryButton && this.categoryContainer) {
        if (e.target !== this.categoryButton.nativeElement && e.target !== this.categoryContainer.nativeElement) {
          this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
        }
      }
    });
  }

  @ViewChild('categoryButton') categoryButton!:ElementRef;
  @ViewChild('categoryContainer') categoryContainer!:ElementRef;

  ngOnInit(): void {
  }
  //kategória kiválasztása
  setSelectedCategory(category: Category){
    this.searchForm.controls.homeCategorySearchTerm.setValue(category.selectedTranslation.text);
    this.isCategoryDropdownOpen = false;
  }
  //kategóriák legördülő menü megnyitása
  openCategory(){
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }
  //keresési eredmény query paraméter átadás, és állások oldalra navigálás
  search(){
    let queryParams: any = {};
    if(this.searchForm.controls.homeTextSearchTerm.value){
      queryParams['text'] = this.searchForm.controls.homeTextSearchTerm.value
    }
    if(this.searchForm.controls.homeCategorySearchTerm.value){
      let categoryId = this.categories.find(element=>element.selectedTranslation.text == this.searchForm.controls.homeCategorySearchTerm.value)?.id;
      queryParams['category'] = categoryId
    }
    this.router.navigate(['/allasok'], {queryParams: queryParams ? queryParams: null});
  }

}
