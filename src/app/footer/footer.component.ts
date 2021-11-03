import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PublicContent } from '../interfaces/public-contents';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  dateYear: number = 0;
  languageSubscription: Subscription = new Subscription();
  publibContents: PublicContent[] = new Array();
  facebook!: PublicContent;
  instagram!: PublicContent;
  twitter!: PublicContent;
  linkedin!: PublicContent;
  companyName: string = '';
  companyBrandText: string = '';
  companyAddress: string = '';
  companyPhone: string = '';
  companyEmail: string = '';
  copyRightsText: string = '';
  pageLoaded!: Promise<boolean>;


  constructor(private languageService: LanguageService,
    private dataService: DataService) {
    const date = new Date();
    this.dateYear = date.getFullYear();
  }

  ngOnInit(): void {
    this.dataService.getAllData('/api/publicContents/getByPagePlaceKey/footer/public').subscribe(res=>{
      this.publibContents = res;
      this.facebook = this.publibContents.find(element=>element.key == 'footerCompanyFacebook')!;
      this.instagram = this.publibContents.find(element=>element.key == 'footerCompanyInstagram')!;
      this.twitter = this.publibContents.find(element=>element.key == 'footerCompanyTwitter')!;
      this.linkedin = this.publibContents.find(element=>element.key == 'footerCompanyLinkedIn')!;
      this.languageSubscription = this.languageService.languageObservable$.subscribe(lang=>{
        this.facebook.selectedTranslation = this.languageService.getTranslation(lang,this.facebook.PublicContentTranslations);
        this.instagram.selectedTranslation = this.languageService.getTranslation(lang,this.instagram.PublicContentTranslations);
        this.twitter.selectedTranslation = this.languageService.getTranslation(lang,this.twitter.PublicContentTranslations);
        this.linkedin.selectedTranslation = this.languageService.getTranslation(lang,this.linkedin.PublicContentTranslations);
        this.companyName = this.languageService.getTranslationByKey(lang, res, 'title', 'footerLogoTitle', 'PublicContentTranslations');
        this.companyBrandText = this.languageService.getTranslationByKey(lang, res, 'title', 'footerLogoSubtitle', 'PublicContentTranslations');
        this.companyAddress = this.languageService.getTranslationByKey(lang, res, 'title', 'footerCompanyAddress', 'PublicContentTranslations');
        this.companyPhone = this.languageService.getTranslationByKey(lang, res, 'title', 'footerCompanyPhone', 'PublicContentTranslations');
        this.companyEmail = this.languageService.getTranslationByKey(lang, res, 'title', 'footerCompanyEmail', 'PublicContentTranslations');
        this.copyRightsText = this.languageService.getTranslationByKey(lang, res, 'title', 'footerCopyRights', 'PublicContentTranslations');
        this.pageLoaded = Promise.resolve(true);
      });
    })
  }

  ngOnDestroy(){
    this.languageSubscription.unsubscribe();
  }

}
