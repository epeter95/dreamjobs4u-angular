import { Component } from '@angular/core';
import { DataService } from './services/data.service';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sweetjobs-angular';
  //az alkalmazáshoz tartozó nyelvek importálása
  constructor(private dataService: DataService, private languageService: LanguageService){
    languageService.initLanguage();
    this.dataService.getAllData('/api/languages/public').subscribe(res => {
      this.languageService.nextLanguagesArray(res);
    });
  }
}
