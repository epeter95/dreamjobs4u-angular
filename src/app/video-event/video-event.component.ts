import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { VideoEvent } from '../interfaces/event';
import { CallService } from '../services/call.service';
import { DataService } from '../services/data.service';
import { CallInfoDialogComponent, CallInfoDialogData } from './call-info-dialog/call-info-dialog.component';

@Component({
  selector: 'app-video-event',
  templateUrl: './video-event.component.html',
  styleUrls: ['./video-event.component.scss']
})
export class VideoEventComponent implements OnInit, OnDestroy {

  callStarted: boolean = false;
  inCall: boolean = false;
  isUserOwner: boolean = false;
  pageLoaded!: Promise<boolean>;
  event!: VideoEvent;
  peerId: string = '';
  isCallStarted$!: Observable<boolean>;
  userId: number = 0;

  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  constructor(public dialog: MatDialog,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private callService: CallService) {
    this.isCallStarted$ = this.callService.isCallStarted$;
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      if (params.get('id')) {
        forkJoin([
          this.dataService.getOneData('/api/events/public/getEventByToken/' + params.get('id'), this.dataService.getAuthHeader()),
          this.dataService.getOneData('/api/events/public/getUserIdByToken', this.dataService.getAuthHeader())
        ])
          .subscribe(res => {
            console.log(res);
            this.event = res[0];
            this.userId = res[1].userId;
            console.log(this.userId);
            this.peerId = this.callService.initPeer(this.event.link);
            if (!this.event.Users.find(element => element.id == this.userId)  && this.userId != this.event.ownerId) {
              this.router.navigate(['/']);
            }
            if (this.event.ownerId == this.userId) {
              this.isUserOwner = true;
            }
            this.pageLoaded = Promise.resolve(true);
          });
      } else {
        this.router.navigate(['/']);
      }
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.callService.localStream$
      .pipe(filter(res => !!res))
      .subscribe(stream => this.localVideo.nativeElement.srcObject = stream)
    this.callService.remoteStream$
      .pipe(filter(res => !!res))
      .subscribe(stream => this.remoteVideo.nativeElement.srcObject = stream)
    }, 1000)
  }

  ngOnDestroy() {
    this.callService.destroyPeer();
  }

  startVideo() {
    this.dialog.open(CallInfoDialogComponent, {
      data: { peerId: this.peerId }
    })
  }

  showModal(joinCall: boolean): void {
    let dialogData: CallInfoDialogData = joinCall ? ({ peerId: '', joinCall: true }) : ({ peerId: this.peerId, joinCall: false });
    const dialogRef = this.dialog.open(CallInfoDialogComponent, {
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(()=>{
      if(dialogData.joinCall){
        of(this.callService.establishMediaCall(dialogData.peerId!))
      }else{
        of(this.callService.enableCallAnswer())
      }
    })
  }

  endCall() {
    this.callService.closeMediaCall();
  }

}

