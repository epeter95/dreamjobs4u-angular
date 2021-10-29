import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './authentication/auth.guard';
import { JobHandleComponent } from './employer-jobs/job-handle/job-handlecomponent';
import { EmployerJobsComponent } from './employer-jobs/employer-jobs.component';
import { MyJobsComponent } from './employer-jobs/my-jobs/my-jobs.component';
import { HomeComponent } from './home/home.component';
import { BasicInformationComponent } from './profile/basic-information/basic-information.component';
import { ChangePasswordComponent } from './profile/change-password/change-password.component';
import { ContactInformationComponent } from './profile/contact-information/contact-information.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  {
    path: 'hirdeteseim', component: EmployerJobsComponent,
    canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
      { path: 'letrehozas', component: JobHandleComponent, pathMatch: 'full' },
      { path: 'modositas', component: JobHandleComponent, pathMatch: 'full' },
      { path: '', component: MyJobsComponent, pathMatch: 'full' },
    ]
  },
  {
    path: 'profil', component: ProfileComponent,
    canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
      { path: 'jelszo-valtoztatas', component: ChangePasswordComponent, pathMatch: 'full' },
      { path: 'elerhetoseg', component: ContactInformationComponent, pathMatch: 'full' },
      { path: '', component: BasicInformationComponent, pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
