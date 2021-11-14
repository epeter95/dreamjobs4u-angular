import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Job } from 'src/app/interfaces/job';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-home-jobs',
  templateUrl: './home-jobs.component.html',
  styleUrls: ['./home-jobs.component.scss']
})
export class HomeJobsComponent implements OnInit {
  @Input() jobs!: Job[];
  @Input() jobsTitleText: string = '';
  @Input() jobsSubtitleText: string = '';
  @Input() allJobButtonText: string = '';
  isMobile: boolean = false;
  constructor(private dataService: DataService) {
    this.isMobile = window.innerWidth < this.dataService.mobileWidth ? true : false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = window.innerWidth < this.dataService.mobileWidth ? true : false;
  }

  ngOnInit(): void {
  }

}
