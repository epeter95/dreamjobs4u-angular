import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
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
  
  searchForm: FormGroup = new FormGroup({
    homeTextSearchTerm: new FormControl(''),
    homeCategorySearchTerm: new FormControl(''),
  });

  isCategoryDropdownOpen: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  
  setSelectedCategory(category: Category){
    this.searchForm.controls.category.setValue(category.selectedTranslation.text);
    this.isCategoryDropdownOpen = false;
  }

  openCategory(){
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

}
