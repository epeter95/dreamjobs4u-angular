import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { FormElement } from 'src/app/interfaces/form-element';
import { AppliedUser, Job } from 'src/app/interfaces/job';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
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
  messageDialogSubscription: Subscription = new Subscription();
  publicContents: PublicContent[] =  new Array();
  eventsTitleText: string = '';
  createEventTitleText: string = '';
  eventSuccessfullyCreatedText: string = '';
  submitButtonText: string = '';
  jobs: Job[] = new Array();
  users: AppliedUser[] = new Array();
  eventForm: FormGroup = new FormGroup({
    eventJob: new FormControl('', Validators.required),
    eventUsers: new FormControl('', Validators.required)
  });

  @ViewChild('appliedUserButton') appliedUserButton!:ElementRef;
  @ViewChildren('appliedUserContainer') appliedUserContainer!:QueryList<any>;
  @ViewChild('jobsButton') jobsButton!:ElementRef;
  @ViewChild('jobsContainer') jobsContainer!:ElementRef;

  constructor(private dataService: DataService,
    private languageService: LanguageService,
    private renderer: Renderer2,
    public dialog: MatDialog) {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.appliedUserButton && this.appliedUserContainer) {
        if (e.target !== this.appliedUserButton.nativeElement) {
          for(let i=0;i<this.appliedUserContainer.toArray().length;++i){
            if(e.target !== this.appliedUserContainer.toArray()[i].nativeElement){
              this.isUsersDropdownOpen = !this.isUsersDropdownOpen;
            }
          }
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
   this.initData();
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
    this.messageDialogSubscription.unsubscribe();
  }

  initData(){
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/employerJobs/public'),
      this.dataService.getAllData('/api/jobs/public/getJobDropdwonDataByToken',this.dataService.getAuthHeader()),
      this.dataService.getAllData('/api/events/public/getEventsByToken',this.dataService.getAuthHeader())
    ]).subscribe(res=>{
      this.publicContents = res[0];
      this.jobs = res[1];
      console.log(res[2]);
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.eventsTitleText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsEventsPageTitle','PublicContentTranslations');
          this.createEventTitleText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsCreateEventText','PublicContentTranslations');
          this.eventSuccessfullyCreatedText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsSuccesfullyCreateEventText','PublicContentTranslations');
          this.submitButtonText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsEventCreateButtonText','PublicContentTranslations');
          this.jobsDropDown.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsEventJobsPlaceholderText','PublicContentTranslations');
          this.usersDropDown.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsEventUsersPlaceholderText','PublicContentTranslations');
          
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }

  setSelectedJob(job: Job){
    this.eventForm.controls.eventJob.setValue(job.companyName);
    this.isJobsDropdownOpen = false;
    this.eventForm.controls.eventUsers.setValue('');
    this.dataService.getAllData('/api/jobs/public/getAppliedUsersByJobId/'+job.id, this.dataService.getAuthHeader()).subscribe(res=>{
      this.users = res;
    });
  }

  setSelectedUsers(user: AppliedUser){
    let name = user.User.lastName + ' ' + user.User.firstName;
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
  }

  createEvent(){
    if(this.eventForm.valid){
      const job = this.jobs.find(element=>element.companyName == this.eventForm.controls.eventJob.value);
      const userNames = this.eventForm.controls.eventUsers.value.split(', ');
      let userIds = [];
      for(let i=0;i<userNames.length;++i){
        let user = this.users.find(element=>{
          return element.User.lastName+' '+element.User.firstName == userNames[i]}
        );
        userIds.push(user?.User.id);
      }
      const result = {
        jobId: job?.id,
        users: userIds
      }
      this.dataService.httpPostMethod('/api/events/public/createEvent', result, this.dataService.getAuthHeader()).subscribe(res=>{
        console.log(res);
        if(!res.error){
          const ref = this.dialog.open(MessageDialogComponent,{
            data: {icon: 'done', text: this.eventSuccessfullyCreatedText},
            backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
            disableClose: true
          });
          this.messageDialogSubscription = ref.afterClosed().subscribe(()=>{
            this.initData();
          });
        }
      });
    }
  }

  openJobs(){
    this.isJobsDropdownOpen = !this.isJobsDropdownOpen;
  }

  openUsers(){
    this.isUsersDropdownOpen = !this.isUsersDropdownOpen;
  }

}
