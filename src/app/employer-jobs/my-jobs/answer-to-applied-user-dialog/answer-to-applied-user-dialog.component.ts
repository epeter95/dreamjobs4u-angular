import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserProfileData } from 'src/app/interfaces/user-data';
import { DataService } from 'src/app/services/data.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-answer-to-applied-user-dialog',
  templateUrl: './answer-to-applied-user-dialog.component.html',
  styleUrls: ['./answer-to-applied-user-dialog.component.scss']
})
export class AnswerToAppliedUserDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<AnswerToAppliedUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserProfileData,
    private languageService: LanguageService,
    private dataService: DataService) { }

  ngOnInit(): void {
  }

  closeDialog(){
    this.dialogRef.close();
  }

}
