import {
  service,
  languages,
  ignoreID,
  ignoreClass,
  ignoreTag,
  detectLocalLanguage,
} from '@params';

/**
 * Ignore class list for the Fixit theme
 * @type {Array<string>}
 */
const IGNORE_FIXIT = [
  'header-title',
  'language-switch',
  'post-author',
  'powered',
  'author',
  'typeit',
  'katex-display',
];

/**
 * Ignore class list for the hugo-fixit components
 * @type {Array<string>}
 */
const IGNORE_CMPTS = [
  'repo-url',
  'netease-music',
  'comment-163',
];

/**
 * AutoTranslate Class
 * @description Auto translate website content by translate.js service.
 * @author [Lruihao](https://lruihao.cn)
 */
class AutoTranslate {
  constructor() {
    // Get params from Hugo project config
    this.service = service;
    this.languages = languages;
    this.ignoreClass = [
      ...IGNORE_FIXIT,
      ...IGNORE_CMPTS,
      ...ignoreClass,
    ];
    this.ignoreID = ignoreID;
    this.ignoreTag = ignoreTag;
    this.detectLocalLanguage = detectLocalLanguage;

    this.isMobile = fixit.util.isMobile();
    this.afterTranslateEvents = new Set();
    this.lang = {
      current: translate.language.getCurrent(),
      local: translate.language.getLocal(),
      query: window.location.search.split('lang=')[1],
    };
  }

  bindDesktopEvents() {
    const switchDesktop = document.querySelector('#header-desktop .language-switch.auto');
    if (!switchDesktop) {
      return;
    }
    const switchMenu = switchDesktop.querySelector('.sub-menu');
    // Artificial language items by Hugo project
    const artificialItems = Array.from(switchMenu.childNodes).filter((node) => node.dataset.type === 'artificial');
    fixit.util.forEach(artificialItems, (item) => {
      item.addEventListener('click', (e) => {
       translate.language.clearCacheLanguage()
      });
    })
    // Machine language items by translate.js service
    const machineItems = Array.from(switchMenu.childNodes).filter((node) => node.dataset.type === 'machine');
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
  }

  bindMobileEvents() {
    const switchMobile = document.querySelector('#header-mobile .language-switch.auto');
    if (!switchMobile) {
      return;
    }
    translate.selectLanguageTag.selectOnChange = (e) => {
      const lang = e.target.value;
      if (e.target.options[e.target.selectedIndex].dataset.type === 'artificial') {
        // Artificial language items by Hugo project
        translate.language.clearCacheLanguage()
        window.location = lang;
      } else {
        // Machine language items by translate.js service
        window.history.pushState({}, '', `?lang=${lang}`);
        translate.changeLanguage(lang);
      }
    };
    const originSwitchMobile = switchMobile.previousElementSibling;
    switchMobile.prepend(originSwitchMobile.querySelector('span').cloneNode(true));
    this.afterTranslateEvents.add(() => {
      const selectEl = switchMobile.querySelector('select');
      selectEl.classList.add('language-select');
      fixit.util.forEach(selectEl.querySelectorAll('option'), (option) => {
        option.dataset.type = 'machine';
      });
      const divider = document.createElement('option');
      divider.disabled = true;
      divider.innerHTML = '-';
      selectEl.prepend(divider);
      fixit.util.forEach(originSwitchMobile.querySelectorAll('option'), (option) => {
        option.dataset.type = 'artificial';
      });
      selectEl.prepend(...originSwitchMobile.querySelectorAll('option:not([selected])'));
      selectEl.prepend(originSwitchMobile.querySelector('option[selected]'));
      const { current, local, query } = this.lang;
      if (current !== local || query) {
        selectEl.value = current;
      }
      originSwitchMobile.classList.add('d-none');
      switchMobile.classList.remove('d-none');
    });
  }

  bindEvents() {
    if (this.isMobile) {
      this.bindMobileEvents();
    } else {
      this.bindDesktopEvents();
    }
    return this;
  }

  setup() {
    if (this.detectLocalLanguage) {
      translate.setAutoDiscriminateLocalLanguage();
    }
    // Set active class for current language (only machine translation)
    const { current, local, query } = this.lang;
    if (current !== local || query) {
      fixit.util.forEach(document.querySelectorAll(`.menu-link[data-lang="${current}"]`), (link) => {
        link.parentElement.classList.add('active');
      });
    }
    translate.ignore.id.push(...this.ignoreID);
    translate.ignore.class.push(...this.ignoreClass);
    translate.ignore.tag.push(...this.ignoreTag);
    translate.service.use(this.service);
    translate.language.setUrlParamControl('lang');
    translate.listener.start();
    translate.selectLanguageTag.show = this.isMobile;
    translate.selectLanguageTag.languages = this.languages.join(',');
    return this;
  }

  execute() {
    translate.execute();
    this.afterTranslateEvents.forEach((event) => {
      event();
    });
    // TODO: selection translate (maybe)
    // translate.language.setDefaultTo('chinese_simplified');
    // translate.selectionTranslate.start();
  }

  init() {
    this.setup()
      .bindEvents()
      .execute();
  }
}

fixit.autoTranslate = new AutoTranslate();

if (document.readyState !== 'loading') {
  fixit.autoTranslate.init();
} else {
  document.addEventListener('DOMContentLoaded', () => fixit.autoTranslate.init(), false);
}
