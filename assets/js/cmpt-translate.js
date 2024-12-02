import * as params from '@params';

class AutoTranslate {
  #IGNORE_CLASS;

  constructor() {
    this.#IGNORE_CLASS = [
      'header-title',
      'language-switch',
      'post-author',
      'powered',
      'author',
      ...params.ignoreClass,
    ];
  }

  addClickLangEvent() {
    const langSwitch = document.querySelector('.language-switch.auto');
    // TODO: add click event to switch language and add query param 'lang' to url
  }

  setupTranslate() {
    translate.ignore.class.push(...this.#IGNORE_CLASS);
    translate.setAutoDiscriminateLocalLanguage();
    translate.service.use('client.edge');
    translate.language.setUrlParamControl('lang');
    translate.listener.start();
    translate.selectLanguageTag.show = false;
    console.log(params.languages);
    translate.execute();
  }

  init() {
    this.addClickLangEvent();
    this.setupTranslate();
  }
}

const autoTranslate = new AutoTranslate();

if (document.readyState !== 'loading') {
  autoTranslate.init();
} else {
  document.addEventListener('DOMContentLoaded', () => autoTranslate.init(), false);
}
