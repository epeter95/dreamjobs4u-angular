import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './authentication/auth.guard';
import { HomeComponent } from './home/home.component';
import { BasicInformationComponent } from './profile/basic-information/basic-information.component';
import { ContactInformationComponent } from './profile/contact-information/contact-information.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  {
    path: 'profil', component: ProfileComponent,
    canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
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
