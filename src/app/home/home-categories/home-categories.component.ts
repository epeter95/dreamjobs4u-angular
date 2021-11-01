import { Component, Input, OnInit } from '@angular/core';
import { Category } from 'src/app/interfaces/category';

@Component({
  selector: 'app-home-categories',
  templateUrl: './home-categories.component.html',
  styleUrls: ['./home-categories.component.scss']
})
export class HomeCategoriesComponent implements OnInit {
  @Input() categories!:Category[];
  @Input() categoryTitle: string = '';
  @Input() categorySubtitle: string = '';
  @Input() categoryJobCountText: string = '';
  @Input() allCategoryButtonText: string = '';
  constructor() { }

  ngOnInit(): void {
  }

}
