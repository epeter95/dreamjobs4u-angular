import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface CallInfoDialogData {
  peerId?: string;
  joinCall: boolean
}

@Component({
  selector: 'app-call-info-dialog',
  templateUrl: './call-info-dialog.component.html',
  styleUrls: ['./call-info-dialog.component.scss']
})
export class CallInfoDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CallInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CallInfoDialogData,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(){}

  public showCopiedSnackBar() {
    this._snackBar.open('Peer ID Copied!', 'Hurrah', {
      duration: 1000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
