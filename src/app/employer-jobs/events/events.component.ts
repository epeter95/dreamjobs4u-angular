import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { VideoEvent } from 'src/app/interfaces/event';
import { FormElement } from 'src/app/interfaces/form-element';
import { AppliedUser, Job } from 'src/app/interfaces/job';
import { PublicContent } from 'src/app/interfaces/public-contents';
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
  eventDateTerm: FormElement = {
    key: 'eventStartDate', placeholder: '', focus: false,
  };

  isUsersDropdownOpen: boolean = false;
  isJobsDropdownOpen: boolean = false;
  pageLoaded!: Promise<boolean>;
  languageSubscription: Subscription = new Subscription();
  messageDialogSubscription: Subscription = new Subscription();
  deleteMessageSubscription: Subscription = new Subscription();
  publicContents: PublicContent[] =  new Array();
  eventsTitleText: string = '';
  createEventTitleText: string = '';
  deleteEventWarningText: string = '';
  eventSuccessfullyCreatedText: string = '';
  submitButtonText: string = '';
  jobs: Job[] = new Array();
  users: AppliedUser[] = new Array();
  date: Date = new Date();
  mandatoryDatumtext: string = '';
  formErrorText: string = '';
  eventPeopleText: string = '';
  tmpStartDateVal = this.date.getFullYear()+'.'+String(this.date.getMonth() + 1).padStart(2, '0')+ '.' + String(this.date.getDate()).padStart(2, '0') + '.-'+ String(this.date.getHours()).padStart(2, '0') + ':' + String(this.date.getMinutes()).padStart(2, '0');
  eventForm: FormGroup = new FormGroup({
    eventJob: new FormControl('', Validators.required),
    eventUsers: new FormControl('', Validators.required),
    eventStartDate: new FormControl(
      this.tmpStartDateVal, Validators.compose([
        Validators.required, Validators.pattern('202[0-9].[0-1][0-9].[0-3][0-9].-[0-2][0-9][:][0-5][0-9]')
      ]))
  });
  
  events: VideoEvent[] = new Array();

  @ViewChild('appliedUserButton') appliedUserButton!:ElementRef;
  @ViewChildren('appliedUserContainer') appliedUserContainer!:ElementRef;
  @ViewChild('jobsButton') jobsButton!:ElementRef;
  @ViewChild('jobsContainer') jobsContainer!:ElementRef;

  constructor(private dataService: DataService,
    private languageService: LanguageService,
    private renderer: Renderer2,
    public dialog: MatDialog) {
    this.renderer.listen('window', 'click', (e: Event) => {
      // if (this.appliedUserButton && this.appliedUserContainer) {
      //   if (e.target !== this.appliedUserButton.nativeElement) {
      //     for(let i=0;i<this.appliedUserContainer.toArray().length;++i){
      //       if(e.target !== this.appliedUserContainer.toArray()[i].nativeElement){
      //         this.isUsersDropdownOpen = !this.isUsersDropdownOpen;
      //       }
      //     }
      //   }
      // }

      if(this.appliedUserButton && this.appliedUserContainer){
        if (e.target !== this.appliedUserButton.nativeElement && e.target !== this.appliedUserContainer.nativeElement) {
          this.isUsersDropdownOpen = false;
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
    this.deleteMessageSubscription.unsubscribe();
  }

  initData(){
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/employerJobs/public'),
      this.dataService.getAllData('/api/jobs/public/getJobDropdwonDataByToken',this.dataService.getAuthHeader()),
      this.dataService.getAllData('/api/events/public/getEventsByToken',this.dataService.getAuthHeader())
    ]).subscribe(res=>{
      this.publicContents = res[0];
      this.jobs = res[1];
      this.events = res[2];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.eventsTitleText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsEventsPageTitle','PublicContentTranslations');
          this.createEventTitleText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsCreateEventText','PublicContentTranslations');
          this.eventSuccessfullyCreatedText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsSuccesfullyCreateEventText','PublicContentTranslations');
          this.submitButtonText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsEventCreateButtonText','PublicContentTranslations');
          this.mandatoryDatumtext = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsMandatoryDateFormatText','PublicContentTranslations');
          this.deleteEventWarningText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerEventDeleteWarningText','PublicContentTranslations');
          this.eventPeopleText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsEventPeopleText','PublicContentTranslations'); 
          this.formErrorText = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerEventWrongFormFormatText','PublicContentTranslations'); 
          
          this.jobsDropDown.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsEventJobsPlaceholderText','PublicContentTranslations');
          this.usersDropDown.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents,'title','employerJobsEventUsersPlaceholderText','PublicContentTranslations');
          this.events = this.events.map(element=>{
            element.Job.selectedTranslation = this.languageService.getTranslation(lang, element.Job.JobTranslations);
            return element;
          })
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }

  setSelectedJob(job: Job){
    this.eventForm.controls.eventJob.setValue(job.companyName);
    this.isJobsDropdownOpen = false;
    this.isUsersDropdownOpen = false;
    this.eventForm.controls.eventUsers.setValue('');
    this.dataService.getAllData('/api/jobs/public/getAppliedUsersByJobId/'+job.id, this.dataService.getAuthHeader()).subscribe(res=>{
      this.users = res;
    });
  }

  setSelectedUsers(user: AppliedUser){
    let name = user.User.lastName + ' ' + user.User.firstName;
    // let currentValue = this.eventForm.controls.eventUsers.value.toString();
    // let tmpValue = currentValue.split(', ');
    // if(currentValue.includes(name)){
    //   currentValue = currentValue.replace(name,'')
    // }else{
    //   if(tmpValue.length[0] != ''){
    //     currentValue+=', '+name
    //   }else{
    //     currentValue+=name;
    //   }
    // }
    // if(currentValue[0] == ','){
    //   currentValue = currentValue.substr(2,currentValue.length-2);
    // }else if(currentValue[currentValue.length-2] == ','){
    //   currentValue = currentValue.substr(0,currentValue.length-2);
    // }
    // this.isUsersDropdownOpen = false;
    this.eventForm.controls.eventUsers.setValue(name);
  }

  createEvent(){
    console.log(this.eventForm.valid);
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
        users: userIds,
        startDate: this.eventForm.controls.eventStartDate.value
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
    }else{
      this.dialog.open(MessageDialogComponent,{
        data: {icon: 'warning', text: this.formErrorText},
        backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
        disableClose: true
      });
    }
  }

  deleteEvent(id: number){
    const ref = this.dialog.open(MessageDialogComponent,{
      data: {id: 'warning', text: this.deleteEventWarningText, cancel: true},
      backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
      disableClose: true
    });
    this.deleteMessageSubscription = ref.afterClosed().subscribe(()=>{
      if(ref.componentInstance.actionNeeded){
        this.dataService.httpDeleteMethod('/api/events/public/delete',id.toString(),this.dataService.getAuthHeader()).subscribe((res:any)=>{
          if(!res.error){
            this.initData();
          }
        });
      }
    })
   
  }

  openJobs(){
    this.isJobsDropdownOpen = !this.isJobsDropdownOpen;
  }

  openUsers(){
    this.isUsersDropdownOpen = !this.isUsersDropdownOpen;
  }

}
