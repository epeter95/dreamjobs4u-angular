import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { FormElement } from '../interfaces/form-element';
import { PublicContent } from '../interfaces/public-contents';
import { ErrorMessage } from '../interfaces/error-message';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';

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

  contactForm: FormGroup = new FormGroup({
    contactFirstName: new FormControl(''),
    contactLastName: new FormControl(''),
    contactEmail: new FormControl('', Validators.email),
    contactSubject: new FormControl('', Validators.required),
    contactMessage: new FormControl('', Validators.required),
  });
  constructor(private dataService: DataService, private languageService: LanguageService) { }

  ngOnInit(): void {
    forkJoin([
      this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/contact/public'),
      this.dataService.getAllData('/api/errorMessages/public')
    ]).subscribe(res=>{
      this.publicContents = res[0];
      this.errorMessages = res[1];
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
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
      });
    });
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

  submitMessage() {
    this.isUserClicked = true;
    if(this.contactForm.valid){
      console.log(this.contactForm.value);
    }
  }

}
