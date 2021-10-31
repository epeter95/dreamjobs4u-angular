import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
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

  constructor(private renderer: Renderer2) {
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

  
  setSelectedCategory(category: Category){
    this.searchForm.controls.homeCategorySearchTerm.setValue(category.selectedTranslation.text);
    this.isCategoryDropdownOpen = false;
  }

  openCategory(){
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

}
