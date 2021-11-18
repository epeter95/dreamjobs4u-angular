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
import { JobComponent } from './job/job.component';
import { PreferedCategoriesComponent } from './profile/prefered-categories/prefered-categories.component';
import { EmployerRoleGuard } from './authentication/employer-role.guard';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryComponent } from './category/category.component';
import { ContactComponent } from './contact/contact.component';
import { JobsComponent } from './jobs/jobs.component';
import { EmployeeRoleGuard } from './authentication/employee-role.guard';
import { AppliedJobsComponent } from './profile/applied-jobs/applied-jobs.component';
import { EventsComponent } from './employer-jobs/events/events.component';
import { VideoEventComponent } from './video-event/video-event.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'kategoriak', component: CategoriesComponent, pathMatch: 'full' },
  { path: 'allasok', component: JobsComponent, pathMatch: 'full' },
  { path: 'kapcsolat', component: ContactComponent, pathMatch: 'full' },
  { path: 'kategoria/:categoryId', component: CategoryComponent, pathMatch: 'full' },
  { path: 'kategoria/:categoryId/allas/:jobId', component: JobComponent, pathMatch: 'full' },
  { path: 'video-esemeny/:id', component: VideoEventComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  {
    path: 'hirdeteseim', component: EmployerJobsComponent,
    canActivate: [AuthGuard, EmployerRoleGuard], canActivateChild: [AuthGuard, EmployerRoleGuard],
    children: [
      { path: 'letrehozas', component: JobHandleComponent, pathMatch: 'full' },
      { path: 'modositas', component: JobHandleComponent, pathMatch: 'full' },
      { path: 'esemenyek', component: EventsComponent, pathMatch: 'full' },
      { path: '', component: MyJobsComponent, pathMatch: 'full' },
    ]
  },
  {
    path: 'profil', component: ProfileComponent,
    canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
      { path: 'preferalt-kategoriak', component: PreferedCategoriesComponent, pathMatch: 'full' },
      { path: 'jelszo-valtoztatas', component: ChangePasswordComponent, pathMatch: 'full' },
      { path: 'elerhetoseg', component: ContactInformationComponent, pathMatch: 'full' },
      { path: 'jelentkezett-allasok', component: AppliedJobsComponent, pathMatch: 'full', canActivate: [EmployeeRoleGuard] },
      { path: '', component: BasicInformationComponent, pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
