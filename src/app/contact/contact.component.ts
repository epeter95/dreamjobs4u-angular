import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { FormElement } from '../interfaces/form-element';
import { PublicContent } from '../interfaces/public-contents';
import { ErrorMessage } from '../interfaces/error-message';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {

  sendButtonText: string = '';
  contactTitleText: string = '';
  contactSubtitleText: string = '';
  isUserClicked: boolean = false;
  contactShortDescriptionText: string = '';
  requiredFieldErrorText: string = '';
  wrongEmailFormatErrorText: string = '';
  languageSubscription: Subscription = new Subscription();
  contactFormElements: FormElement[] = [
    { key: 'contactFirstName', focus: false, placeholder: '' },
    { key: 'contactLastName', focus: false, placeholder: '' },
    { key: 'contactEmail', focus: false, placeholder: '' },
    { key: 'contactSubject', focus: false, placeholder: '' },
    { key: 'contactMessage', focus: false, placeholder: '', fieldType: 'textarea' }
  ];
  publicContents: PublicContent[] = new Array();
  errorMessages: ErrorMessage[] = new Array();
  pageLoaded!: Promise<boolean>;

  contactForm: FormGroup = new FormGroup({
    contactFirstName: new FormControl(''),
    contactLastName: new FormControl(''),
    contactEmail: new FormControl('', Validators.email),
    contactSubject: new FormControl('', Validators.required),
    contactMessage: new FormControl('', Validators.required),
  });
  constructor(private dataService: DataService,
    private languageService: LanguageService, public dialog: MatDialog) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/contact/public'),
      this.dataService.getAllData('/api/errorMessages/public')
    ]).subscribe(res=>{
      this.publicContents = res[0];
      this.errorMessages = res[1];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        if(lang){
          this.contactTitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'contactTitle', 'PublicContentTranslations');
          this.contactSubtitleText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'contactSubtitle', 'PublicContentTranslations');
          this.contactShortDescriptionText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'contactShortDescription', 'PublicContentTranslations');
          this.sendButtonText = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', 'contactSendButtonText', 'PublicContentTranslations');
          this.requiredFieldErrorText = this.languageService.getTranslationByKey(lang,this.errorMessages,'text','requiredFieldErrorMessage', 'ErrorMessageTranslations');
          this.wrongEmailFormatErrorText = this.languageService.getTranslationByKey(lang,this.errorMessages,'text','wrongEmailFormat', 'ErrorMessageTranslations');
          this.contactFormElements = this.contactFormElements.map(element => {
            element.placeholder = this.languageService.getTranslationByKey(lang, this.publicContents, 'title', element.key, 'PublicContentTranslations');
            return element;
          });
          this.pageLoaded = Promise.resolve(true);
        }
      });
    });
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

  submitMessage() {
    this.isUserClicked = true;
    if(this.contactForm.valid){
      const result = {
        firstName: this.contactForm.controls.contactFirstName.value,
        lastName: this.contactForm.controls.contactLastName.value,
        email: this.contactForm.controls.contactEmail.value,
        subject: this.contactForm.controls.contactSubject.value,
        message: this.contactForm.controls.contactMessage.value,
      }

      this.dataService.httpPostMethod('/api/contacts/sendMailFromContact', result).subscribe(res=>{
        console.log(res);
        if(res.ok){
          this.dialog.open(MessageDialogComponent,{
            data: {icon: 'done', text: 'Észrevételét továbbítottuk!'},
            backdropClass: 'general-dialog-background', panelClass: 'general-dialog-panel',
            disableClose: true
          });
        }
      });
    }
  }

}
