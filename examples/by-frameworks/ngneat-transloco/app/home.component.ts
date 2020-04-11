import { Component, OnInit } from '@angular/core'
import { TranslocoService } from '@ngneat/transloco'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(private service: TranslocoService) {}

  ngOnInit() {
    this.service.selectTranslate('some.nested.key').subscribe(console.log)
    this.service
      .selectTranslate('params', { value: 'Transloco' })
      .subscribe(console.log)
    this.service.selectTranslateObject('some.nested').subscribe(console.log)
  }
}
