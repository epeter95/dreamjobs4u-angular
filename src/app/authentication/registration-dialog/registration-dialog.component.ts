import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FormElement } from 'src/app/interfaces/form-element';

@Component({
  selector: 'app-registration-dialog',
  templateUrl: './registration-dialog.component.html',
  styleUrls: ['./registration-dialog.component.scss']
})
export class RegistrationDialogComponent implements OnInit {

  isEmployee: boolean = false;
  isEmployer: boolean = false;

  registrationFormElements: FormElement[] = [
    { key: 'firstName', placeholder: 'Vezetéknév', focus: false },
    { key: 'lastName', placeholder: 'Keresztnév', focus: false },
    { key: 'email', placeholder: 'Email cím', focus: false },
    { key: 'confirmPassword', placeholder: 'Jelszó megerősítése', focus: false, type: "password"},
    { key: 'password', placeholder: 'Jelszó', focus: false , type: "password"}
  ]

  registrationForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    confirmPassword: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  closeDialog() {
    this.dialogRef.close();
  }

  setRoleActive(role: string) {
    if (role == 'employee') {
      this.isEmployee = true;
      this.isEmployer = false;
    } else {
      this.isEmployee = false;
      this.isEmployer = true;
    }
  }

  constructor(private dialogRef: MatDialogRef<RegistrationDialogComponent>) { }

  ngOnInit(): void {
  }

  register() {

  }

}
