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
      'typeit',
      ...params.ignoreClass,
    ];
  }

  bindEvents() {
    // Desktop
    const switchDesktop = document.querySelector('#header-desktop .language-switch.auto');
    const switchMenuDesktop = switchDesktop.querySelector('.sub-menu');
    // Artificial language items by Hugo project
    const artificialItems = Array.from(switchMenuDesktop.childNodes).filter((node) => node.dataset.type === 'artificial');
    fixit.util.forEach(artificialItems, (item) => {
      item.addEventListener('click', (e) => {
       translate.language.clearCacheLanguage()
      });
    })
    // Machine language items by translate.js service
    const machineItems = Array.from(switchMenuDesktop.childNodes).filter((node) => node.dataset.type === 'machine');
    fixit.util.forEach(machineItems, (item) => {
      item.addEventListener('click', (e) => {
        // set query param 'lang' to url
        const lang = item.children[0].dataset.lang;
        window.history.pushState({}, '', `?lang=${lang}`);

        // toggle active class
        machineItems.forEach((item) => {
          item.classList.remove('active');
        });
        item.classList.add('active');

        // translate to selected language
        translate.changeLanguage(lang);
      });
    })
    switchDesktop.previousElementSibling.classList.add('d-none');
    switchDesktop.classList.remove('d-none');

    // Mobile
    // TODO
  }

  setup() {
    if (params.detectionLocalLanguage) {
      translate.setAutoDiscriminateLocalLanguage();
    }
    // Set active class for current language (only machine translation)
    const current = translate.language.getCurrent();
    const local = translate.language.getLocal();
    const lang = window.location.search.split('lang=')[1];
    if (current === local || lang) {
      fixit.util.forEach(document.querySelectorAll(`.menu-link[data-lang="${lang}"]`), (link) => {
        link.parentElement.classList.add('active');
      });
    }
    translate.ignore.class.push(...this.#IGNORE_CLASS);
    translate.service.use('client.edge');
    translate.language.setUrlParamControl('lang');
    translate.listener.start();
    translate.selectLanguageTag.show = false;
    translate.execute();
  }

  init() {
    this.bindEvents();
    this.setup();
  }
}

const autoTranslate = new AutoTranslate();

if (document.readyState !== 'loading') {
  autoTranslate.init();
} else {
  document.addEventListener('DOMContentLoaded', () => autoTranslate.init(), false);
}
