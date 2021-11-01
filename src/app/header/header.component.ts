import { HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginComponent } from '../authentication/login/login.component';
import { RegistrationDialogComponent } from '../authentication/registration-dialog/registration-dialog.component';
import { RegistrationDoneDialog } from '../authentication/registration-done-dialog/registration-done-dialog.component';
import { Language } from '../interfaces/language';
import { PublicContent } from '../interfaces/public-contents';
import { UserData } from '../interfaces/user-data';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { ProfileService } from '../services/profile.service';
import { RoleService } from '../services/role.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isRegistrationOpen: boolean = false;
  isLoginOpen: boolean = false;
  userLoggedIn: boolean = false;
  registrationDialogSubscription: Subscription = new Subscription();
  registrationDoneDialogSubscription: Subscription = new Subscription();
  userLoggedInSubscription: Subscription = new Subscription();
  userDataSubscription: Subscription = new Subscription();
  profileDataSubscription: Subscription = new Subscription();
  loginDialogSubscription: Subscription = new Subscription();
  languageSubscription: Subscription = new Subscription();
  userData!: UserData;
  isProfileMenuOpen: boolean = false;
  isUserMenuOpen: boolean = false;
  isEmployee: boolean = false;
  isEmployer: boolean = false;
  loginText: string = '';
  logoutText: string = '';
  registrationText: string = '';
  profileText: string = '';
  myJobsText: string = '';
  languages: Language[] = new Array();
  isLanguagesOpen: boolean = false;
  activeLanguageKey: string = '';
  pageLoaded!: Promise<boolean>;
  publicContents: PublicContent[] = new Array();
  categoryText: string = '';

  @ViewChild('userButton') userButton!: ElementRef;
  @ViewChild('userContainer') userContainer!: ElementRef;
  @ViewChild('languageButton') languageButton!: ElementRef;
  @ViewChild('languageContainer') languageContainer!: ElementRef;
  @ViewChild('profileButton') profileButton!: ElementRef;
  @ViewChild('profileContainer') profileContainer!: ElementRef;

  constructor(
    public dialog: MatDialog,
    private sessionService: SessionService,
    private dataService: DataService,
    private renderer: Renderer2,
    private profileService: ProfileService,
    private roleService: RoleService,
    private languageService: LanguageService
  ) {
    this.isEmployee = this.roleService.checkEmployeeRole(this.roleService.getRole()!);
    this.isEmployer = this.roleService.checkEmployerRole(this.roleService.getRole()!);
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.profileButton && this.profileContainer) {
        if (e.target !== this.profileButton.nativeElement && e.target !== this.profileContainer.nativeElement) {
          this.isProfileMenuOpen = !this.isProfileMenuOpen;
        }
      }

      if (this.userButton && this.userContainer) {
        if (e.target !== this.userButton.nativeElement && e.target !== this.userContainer.nativeElement) {
          this.isUserMenuOpen = !this.isUserMenuOpen;
        }
      }

      if (this.languageButton && this.languageContainer) {
        if (e.target !== this.languageButton.nativeElement && e.target !== this.languageContainer.nativeElement) {
          this.isLanguagesOpen = !this.isLanguagesOpen;
        }
      }
    });
  }

  ngOnInit(): void {
    this.userLoggedInSubscription = this.sessionService.userLoggedInObservable$.subscribe(state => {
      this.userLoggedIn = state;
    });
    this.userDataSubscription = this.sessionService.userDataObservable$.subscribe(data => {
      this.userData = data;
      if(this.userData.profilePicture){
        this.userData.profilePicture = this.userData.profilePicture;
      }
    });
    if (this.sessionService.getSession()) {
      this.profileDataSubscription = this.profileService.refreshProfileDataObservable$.subscribe(refresh => {
        if (refresh) {
         this.getUserData();
        }
      });
      this.getUserData();
    }
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/navbar/public'),
      this.dataService.getAllData('/api/languages/public')
    ]).subscribe(res=>{
      this.publicContents = res[0];
      this.languages = res[1];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.myJobsText = this.languageService.getTranslationByKey(lang,this.publicContents ,'title','navbarMyJobsText','PublicContentTranslations');
          this.loginText = this.languageService.getTranslationByKey(lang,this.publicContents ,'title','navbarLoginText','PublicContentTranslations');
          this.registrationText = this.languageService.getTranslationByKey(lang,this.publicContents ,'title','navbarRegistrationText','PublicContentTranslations');
          this.profileText = this.languageService.getTranslationByKey(lang,this.publicContents ,'title','navbarProfileText','PublicContentTranslations');
          this.logoutText = this.languageService.getTranslationByKey(lang,this.publicContents ,'title','navbarLogoutText','PublicContentTranslations');
          this.categoryText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title','navbarCategoryText', 'PublicContentTranslations');
          this.languages = this.languages.map((element: Language)=>{
            if(element.key=='hu'){
              element.flag = '/assets/images/hun-flag.png';
            }else if(element.key == 'en'){
              element.flag = '/assets/images/eng-flag.png';
            }
            element.selectedTranslation = this.languageService.getTranslation(lang,element.LanguageTranslations);
            return element;
          });
          this.activeLanguageKey = this.languageService.getLangauge()!;
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }

  setLanguage(language: Language){
    this.languageService.nextLanguage(language.key);
    this.isLanguagesOpen = false;
  }

  getUserData(){
    this.dataService.getOneData('/api/users/getDataForPublic', this.dataService.getAuthHeader()).subscribe(data => {
      this.userData = data;
      if(this.userData.profilePicture){
        this.userData.profilePicture = this.userData.profilePicture;
      }
    });
  }

  openLanguges(){
    this.isLanguagesOpen = !this.isLanguagesOpen;
  }

  openUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  ngOnDestroy() {
    this.registrationDialogSubscription.unsubscribe();
    this.registrationDoneDialogSubscription.unsubscribe();
    this.userLoggedInSubscription.unsubscribe();
    this.userDataSubscription.unsubscribe();
    this.profileDataSubscription.unsubscribe();
    this.languageSubscription.unsubscribe();
  }

  openProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  openRegistrationDialog() {
    this.isRegistrationOpen = true;
    this.isUserMenuOpen = false;
    const registrationDialogRef = this.dialog.open(RegistrationDialogComponent, {
      backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
      disableClose: true
    });
    this.registrationDialogSubscription = registrationDialogRef.afterClosed().subscribe(() => {
      this.isRegistrationOpen = false;
      if (registrationDialogRef.componentInstance.isRegistrationSuccess) {
        const registrationDoneDialogRef = this.dialog.open(RegistrationDoneDialog, {
          backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
          disableClose: true
        });
        this.registrationDoneDialogSubscription = registrationDoneDialogRef.afterClosed().subscribe(() => {
          if (registrationDoneDialogRef.componentInstance.openLoginNeeded) {
            this.openLoginDialog();
          }
        });
      }
    });
  }

  openLoginDialog() {
    this.isLoginOpen = true;
    this.isUserMenuOpen = false;
    const loginDialogRef = this.dialog.open(LoginComponent, {
      backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
      disableClose: true
    });
    this.loginDialogSubscription = loginDialogRef.afterClosed().subscribe(() => {
      this.isLoginOpen = false;
      location.reload();
    });
  }

  logout() {
    this.isProfileMenuOpen = false;
    this.roleService.clearRole();
    this.sessionService.clearSession();
    location.reload();
  }
}
