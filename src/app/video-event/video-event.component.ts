import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VideoEvent } from '../interfaces/event';
import { DataService } from '../services/data.service';
import { CallInfoDialogComponent } from './call-info-dialog/call-info-dialog.component';

@Component({
  selector: 'app-video-event',
  templateUrl: './video-event.component.html',
  styleUrls: ['./video-event.component.scss']
})
export class VideoEventComponent implements OnInit {

  callStarted: boolean = false;
  inCall: boolean = false;
  isUserOwner: boolean = false;
  pageLoaded!: Promise<boolean>;
  event!: VideoEvent;
  userId: number = 0;

  constructor(public dialog: MatDialog, private dataService: DataService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params=>{
      if(params.get('id')){
        forkJoin([
          this.dataService.getOneData('/api/events/public/getEventByToken/'+params.get('id'), this.dataService.getAuthHeader()),
          this.dataService.getOneData('/api/events/public/getUserIdByToken', this.dataService.getAuthHeader())
        ])
        .subscribe(res=>{
          console.log(res);
          this.event = res[0];
          this.userId = res[1].userId;
          if(!this.event.Users.find(element=>element.id == this.userId)){
            console.log("HALLÓ")
          }
          if(this.event.ownerId == this.userId){
            this.isUserOwner = true;
          }
          this.pageLoaded = Promise.resolve(true);
        });
      }else{
        this.router.navigate(['/']);
      }
    })
  }

  startVideo(){
    this.dialog.open(CallInfoDialogComponent,{
      data: {peerId: this.event.link}
    })
  }

}
