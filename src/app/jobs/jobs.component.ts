import { Component, OnInit } from '@angular/core';
import { Job } from '../interfaces/job';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
  jobs: Job[] = new Array();
  constructor() { }

  ngOnInit(): void {
  }

}
