import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h2>{{ 'HOME.TITLE' | translate }}</h2>
      <label>
        {{
          'HOME.SELECT' | translate
        }}
        <select attr="'HOME.SELECT' | translate">
          <option *ngFor="let lang of translate.getLangs()" [value]="lang" [selected]="lang === translate.currentLang">{{ lang }}</option>
        </select>
        <div translate> HOME.SELECT </div>
      </label>
    </div>
  `,
})
export class AppComponent {
  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'fr'])
    translate.setDefaultLang('en')

    translate.get('HOME.TITLE', { value: 'world' }).subscribe((res: string) => {
      console.log(res)
      //= > 'hello world'
    })

    const browserLang = translate.getBrowserLang()
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en')
  }
}
