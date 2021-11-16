import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { AppliedUser, Job } from 'src/app/interfaces/job';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit, OnDestroy {
  usersDropDown: FormElement = {
    key: 'eventUsers', placeholder: '', focus: false,
  };
  jobsDropDown: FormElement = {
    key: 'eventJob', placeholder: '', focus: false,
  };

  isUsersDropdownOpen: boolean = false;
  isJobsDropdownOpen: boolean = false;
  pageLoaded!: Promise<boolean>;
  languageSubscription: Subscription = new Subscription();
  publicContents: PublicContent[] =  new Array();
  eventsTitleText: string = '';
  jobs: Job[] = new Array();
  users: AppliedUser[] = new Array();

  eventForm: FormGroup = new FormGroup({
    eventJob: new FormControl('', Validators.required),
    eventUsers: new FormControl('', Validators.required)
  });

  setSelectedJob(job: Job){
    this.eventForm.controls.eventJob.setValue(job.companyName);
    this.isJobsDropdownOpen = false;
    this.eventForm.controls.eventUsers.setValue('');
    this.dataService.getAllData('/api/jobs/public/getAppliedUsersByJobId/'+job.id, this.dataService.getAuthHeader()).subscribe(res=>{
      this.users = res;
    });
  }

  setSelectedUsers(user: AppliedUser){
    let name = user.User.firstName + ' ' + user.User.lastName;
    let currentValue = this.eventForm.controls.eventUsers.value.toString();
    let tmpValue = currentValue.split(', ');
    if(currentValue.includes(name)){
      currentValue = currentValue.replace(name,'')
    }else{
      if(tmpValue.length[0] != ''){
        currentValue+=', '+name
      }else{
        currentValue+=name;
      }
    }
    if(currentValue[0] == ','){
      currentValue = currentValue.substr(2,currentValue.length-2);
    }else if(currentValue[currentValue.length-2] == ','){
      currentValue = currentValue.substr(0,currentValue.length-2);
    }
    this.eventForm.controls.eventUsers.setValue(currentValue);
    this.isUsersDropdownOpen = false;
  }
  @ViewChild('appliedUserButton') appliedUserButton!:ElementRef;
  @ViewChild('appliedUserContainer') appliedUserContainer!:ElementRef;
  @ViewChild('jobsButton') jobsButton!:ElementRef;
  @ViewChild('jobsContainer') jobsContainer!:ElementRef;
  constructor(private dataService: DataService,
    private languageService: LanguageService,
    private renderer: Renderer2) {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.appliedUserButton && this.appliedUserContainer) {
        if (e.target !== this.appliedUserButton.nativeElement && e.target !== this.appliedUserContainer.nativeElement) {
          this.isUsersDropdownOpen = !this.isUsersDropdownOpen;
        }
      }

      if (this.jobsButton && this.jobsContainer) {
        if (e.target !== this.jobsButton.nativeElement && e.target !== this.jobsContainer.nativeElement) {
          this.isJobsDropdownOpen = !this.isJobsDropdownOpen;
        }
      }
    });
  }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/employerJobs/public'),
      this.dataService.getAllData('/api/jobs/public/getJobDropdwonDataByToken',this.dataService.getAuthHeader())
    ]).subscribe(res=>{
      this.publicContents = res[0];
      this.jobs = res[1];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.eventsTitleText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsEventsPageTitle','PublicContentTranslations');
          this.pageLoaded = Promise.resolve(true);
        }
      });
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

  createEvent(){
    if(this.eventForm.valid){

    }
  }

  openJobs(){
    this.isJobsDropdownOpen = !this.isJobsDropdownOpen;
  }

  openUsers(){
    this.isUsersDropdownOpen = !this.isUsersDropdownOpen;
  }

}
