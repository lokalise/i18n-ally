<template>
  <div>
    <h2>{{ 'HOME.TITLE' | translate }}</h2>
    <label>
      {{ 'HOME.SELECT' | translate }}
      <select #langSelect (change)="translate.use(langSelect.value)">
        <option *ngFor="let lang of translate.getLangs()" [value]="lang" [selected]="lang === translate.currentLang">{{ lang }}</option>
      </select>
    </label>
  </div>
</template>
