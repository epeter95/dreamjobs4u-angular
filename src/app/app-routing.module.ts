import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './authentication/auth.guard';
import { HomeComponent } from './home/home.component';
import { BasicInformationComponent } from './profile/basic-information/basic-information.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  {
    path: 'profile', component: ProfileComponent, pathMatch: 'full',
    canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
      { path: '', component: BasicInformationComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
