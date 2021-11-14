import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Category } from 'src/app/interfaces/category';
import { DataService } from 'src/app/services/data.service';

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
  isMobile: boolean = false;
  sliceIndex: number = 8;
  constructor(private dataService: DataService) {
    this.calculateSliceIndex();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.calculateSliceIndex();
  }

  calculateSliceIndex(){
    let windowWidth = window.innerWidth;
    if(window.innerWidth >= this.dataService.mobileWidth){
      this.sliceIndex = 8;
    } else if(windowWidth<this.dataService.mobileWidth && windowWidth >= 900){
      this.sliceIndex = 6;
    } else if(windowWidth<900){
      this.sliceIndex = 4;
    }
  }

  ngOnInit(): void {
  }

}
