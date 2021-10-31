import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { RegistrationDialogComponent } from './authentication/registration-dialog/registration-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistrationDoneDialog } from './authentication/registration-done-dialog/registration-done-dialog.component';
import { LoginComponent } from './authentication/login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { BasicInformationComponent } from './profile/basic-information/basic-information.component';
import { ContactInformationComponent } from './profile/contact-information/contact-information.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { ChangePasswordComponent } from './profile/change-password/change-password.component';
import { EmployerJobsComponent } from './employer-jobs/employer-jobs.component';
import { MyJobsComponent } from './employer-jobs/my-jobs/my-jobs.component';
import { JobHandleComponent } from './employer-jobs/job-handle/job-handlecomponent';
import { SanitizerPipe } from './pipes/sanitizer.pipe';
import { JobComponent } from './job/job.component';
import { PreferedCategoriesComponent } from './profile/prefered-categories/prefered-categories.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    RegistrationDialogComponent,
    RegistrationDoneDialog,
    LoginComponent,
    ProfileComponent,
    BasicInformationComponent,
    ContactInformationComponent,
    MessageDialogComponent,
    ChangePasswordComponent,
    EmployerJobsComponent,
    MyJobsComponent,
    JobHandleComponent,
    SanitizerPipe,
    JobComponent,
    PreferedCategoriesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    MatDialogModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
