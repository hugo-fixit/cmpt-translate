import {
  service,
  languages,
  ignoreID,
  ignoreClass,
  ignoreTag,
  detectLocalLanguage,
  supportLanguages,
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
      local: window.pageLang || translate.language.getLocal(),
      query: window.location.search.split('lang=')[1],
      browser: translate.util.browserDefaultLanguage(),
    };
    this.supportLanguages = {
      'client.edge': translate.service.edge.language.json,
      'translate.service': supportLanguages,
    };
  }

  /**
   * Get language name by language id from translate.js service
   * @param {String} id The language id
   * @returns {String} The language name
   */
  getLangNameById(id) {
    return this.supportLanguages[this.service]?.find((lang) => lang.id === id)?.name;
  }

  bindDesktopEvents() {
    const switchDesktop = document.querySelector('#header-desktop .language-switch.auto');
    if (!switchDesktop) {
      return;
    }
    const switchMenu = switchDesktop.querySelector('.sub-menu');
    if (this.detectLocalLanguage) {
      const langName = this.getLangNameById(this.lang.browser);
      // add detect local language item
      if (langName) {
        const localItem = document.createElement('li');
        localItem.classList.add('menu-item');
        localItem.dataset.type = 'machine';
        localItem.innerHTML = `<a data-lang="${this.lang.browser}" class="menu-link" title="${langName}"><i class="fa-solid fa-robot fa-fw fa-sm" aria-hidden="true"></i> ${langName}</a>`;
        switchMenu.insertBefore(localItem, switchMenu.querySelector('.menu-item-divider').nextSibling);
      }
    }
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
      const lang = item.children[0].dataset.lang;
      // hide unsupported languages for 'client.edge' service
      if (this.service === 'client.edge') {
        if (!this.getLangNameById(lang)) {
          item.classList.add('d-none');
          return;
        }
      }
      item.addEventListener('click', (e) => {
        // set query param 'lang' to url
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
    const originSwitchDesktop = switchDesktop.previousElementSibling;
    if (originSwitchDesktop.classList.contains('language-switch')) {
      originSwitchDesktop.classList.add('d-none');
    }
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
      if (
        this.languages.length &&
        !this.languages.includes(this.lang.browser) &&
        this.getLangNameById(this.lang.browser)
      ) {
        // add detect local language
        this.languages.push(this.lang.browser);
      }
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
    translate.language.setLocal(this.lang.local);
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
  }

  /**
   * Enable selection translate
   * https://github.com/hugo-fixit/cmpt-translate/issues/3
   * @experimental
   * @param {String} lang The language code to translate
   * @example fixit.autoTranslate.enableSelection();
   * @todo Refactor the translate.selectionTranslate function
   * @todo target language should be user selected from the language switch
   * @todo to support query param 'to' to set the target language
   */
  selectionTranslate(lang = 'chinese_simplified') {
    translate.language.setDefaultTo(lang);
    translate.selectionTranslate.start();
    // translate.executeByLocalLanguage();
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
