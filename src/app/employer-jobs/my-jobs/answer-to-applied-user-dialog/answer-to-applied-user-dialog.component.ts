import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { AppliedUserStatus } from 'src/app/interfaces/applied-user-status';
import { PublicContent } from 'src/app/interfaces/public-contents';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';
export interface AnswerDialogData{
  profile: UserProfileData,
  status: number;
  lang: string;
  jobName: string;
  jobCompany: string;
  jobId: number;
  userId: number;
}
@Component({
  selector: 'app-answer-to-applied-user-dialog',
  templateUrl: './answer-to-applied-user-dialog.component.html',
  styleUrls: ['./answer-to-applied-user-dialog.component.scss']
})
export class AnswerToAppliedUserDialogComponent implements OnInit {
  messageIsFocused: boolean = false;
  messageControl: FormControl = new FormControl('', Validators.required);
  userStatuses: AppliedUserStatus[] = new Array();
  activeStatusId: string = '';
  fileData!: File | string;
  fileUrl: string = '';
  messageIsMissing: boolean = false;
  publicContents: PublicContent[] = new Array();
  fileUploadText: string = '';
  sendButtonText: string = '';
  answerTitleText: string = '';
  messageTitleText: string = '';
  missingMessageText: string = '';

  constructor(private dialogRef: MatDialogRef<AnswerToAppliedUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AnswerDialogData,
    private languageService: LanguageService,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.activeStatusId = this.data.status.toString();
    console.log(this.data);
    forkJoin([
      this.dataService.getAllData('/api/appliedUserStatuses/public'),
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/employerJobs/public')
    ]).subscribe(res=>{
      this.userStatuses = res[0].map((element: AppliedUserStatus)=>{
        element.selectedTranslation = this.languageService.getTranslation(this.data.lang, element.AppliedUserStatusTranslations);
        return element;
      });
      this.publicContents = res[1];
      this.answerTitleText = this.languageService.getTranslationByKey(this.data.lang, this.publicContents, 'title', 'employerJobsSendAnswerToText', 'PublicContentTranslations');
      this.messageTitleText = this.languageService.getTranslationByKey(this.data.lang, this.publicContents, 'title', 'employerJobsAnswerMessageText', 'PublicContentTranslations');
      this.fileUploadText = this.languageService.getTranslationByKey(this.data.lang, this.publicContents, 'title', 'employerJobsUploadFileText', 'PublicContentTranslations');
      this.sendButtonText = this.languageService.getTranslationByKey(this.data.lang, this.publicContents, 'title', 'employerJobsSendButtonText', 'PublicContentTranslations');
      this.missingMessageText = this.languageService.getTranslationByKey(this.data.lang, this.publicContents, 'title', 'employerJobsMissingMessageText', 'PublicContentTranslations');
    });
  }

  handleFileUpload(event: any) {
    this.fileData = event.target.files[0] as File;
    this.fileUrl = this.fileData.name;
  }

  setActiveId(status: AppliedUserStatus){
    this.activeStatusId = status.id.toString();
  }

  closeDialog(){
    this.dialogRef.close();
  }

  sendAnswer(){
    if(this.messageControl.valid){
      let formData = new FormData();
      formData.append('message',this.messageControl.value);
      formData.append('toEmail', this.data.profile.email);
      formData.append('jobName', this.data.jobName);
      formData.append('jobCompany', this.data.jobCompany);
      formData.append('appliedUserStatusId', this.activeStatusId);
      formData.append('jobId', this.data.jobId.toString());
      formData.append('userId', this.data.userId.toString());
      if(this.fileData){
        formData.append('fileData', this.fileData);
      }
      this.dataService.httpPostMethod('/api/users/public/sendAnswerToAppliedUser',formData, this.dataService.getAuthHeader()).subscribe(res=>{
        console.log(res);
      });
    }else{
      this.messageIsMissing = true;
    }
  }

}
