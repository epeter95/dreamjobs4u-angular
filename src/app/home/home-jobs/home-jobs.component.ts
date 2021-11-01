import { Component, Input, OnInit } from '@angular/core';
import { Job } from 'src/app/interfaces/job';

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
  constructor() {}

  ngOnInit(): void {
  }

}
