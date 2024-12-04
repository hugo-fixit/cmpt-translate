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
      local: window.ATConfig.local || translate.language.getLocal(),
      query: window.location.search.split('lang=')[1],
      browser: translate.util.browserDefaultLanguage(),
    };
    this.supportLanguages = {
      'client.edge': translate.service.edge.language.json,
      'translate.service': supportLanguages,
    };
    this.hugoLangCodes = window.ATConfig.hugoLangCodes;
  }

  /**
   * Get language name by language id from translate.js service
   * @param {String} id The language id, e.g. 'chinese_simplified'
   * @returns {String} The language name, e.g. '简体中文'
   */
  getLangNameById(id) {
    return this.supportLanguages[this.service]?.find((lang) => lang.id === id)?.name;
  }

  /**
   * Get browser language code by language id from translate.js service
   * @param {String} id The language id, e.g. 'chinese_simplified'
   * @returns {String} The language code, e.g. 'zh-CN'
   */
  getLangCodeById(id) {
    return Object.keys(translate.util.browserLanguage).find((code) => translate.util.browserLanguage[code] === id);
  }

  /**
   * Get language id by browser language code
   * @param {String} code The language code, e.g. 'zh-CN'
   * @returns {String} The language id, e.g. 'chinese_simplified'
   */
  getLangIdByCode(code) {
    return translate.util.browserLanguage[code];
  }
  
  /**
   * Toggle element visibility
   * @param {Element} el
   * @param {Boolean} visibility
   */
  toggleVisibility(el, visibility) {
    el.classList.toggle('d-none', !visibility);
    el.setAttribute('aria-hidden', !visibility);
  }

  bindDesktopEvents() {
    const switchDesktop = document.querySelector('#header-desktop .language-switch.auto');
    if (!switchDesktop) {
      return;
    }
    const switchMenu = switchDesktop.querySelector('.sub-menu');
    if (this.detectLocalLanguage) {
      const langName = this.getLangNameById(this.lang.browser);
      const langCode = this.getLangCodeById(this.lang.browser);
      if (
        langName &&
        !this.hugoLangCodes.includes(langCode) &&
        !switchMenu.querySelector(`[data-lang="${this.lang.browser}"]`)
      ) {
        // add detect local language item
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
        if (this.detectLocalLanguage) {
          translate.changeLanguage(this.lang.local);
        } else {
          translate.language.clearCacheLanguage();
        }
      });
    })
    // Machine language items by translate.js service
    const machineItems = Array.from(switchMenu.childNodes).filter((node) => node.dataset.type === 'machine');
    fixit.util.forEach(machineItems, (item) => {
      const langId = item.children[0].dataset.lang;
      const langName = this.getLangNameById(langId);
      const langCode = this.getLangCodeById(langId);
      // hide unsupported languages for 'client.edge' service
      if (this.service === 'client.edge') {
        if (!langName) {
          this.toggleVisibility(item, false);
          return;
        }
      }
      if (this.hugoLangCodes.includes(langCode)) {
        this.toggleVisibility(item, false);
        return;
      }
      item.addEventListener('click', (e) => {
        // set query param 'lang' to url
        window.history.pushState({}, '', `?lang=${langId}`);
        // toggle active class
        machineItems.forEach((item) => {
          item.classList.remove('active');
          item.children[0].classList.remove('text-secondary')
        });
        item.classList.add('active');
        item.children[0].classList.add('text-secondary')
        // translate to selected language
        translate.changeLanguage(langId);
      });
    })
    const originSwitchDesktop = switchDesktop.previousElementSibling;
    if (originSwitchDesktop.classList.contains('language-switch')) {
      this.toggleVisibility(originSwitchDesktop, false);
    }
    this.toggleVisibility(switchDesktop, true);
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
        if (this.detectLocalLanguage) {
          translate.changeLanguage(this.lang.local);
        } else {
          translate.language.clearCacheLanguage();
        }
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
        option.innerText = `🤖 ${option.innerText}`;
        const langCode = this.getLangCodeById(option.value);
        if (this.hugoLangCodes.includes(langCode)) {
          // Safari can not use "display: none;" for option. (Safari sucks!!!)
          // this.toggleVisibility(option, false);
          option.parentElement.removeChild(option);
        }
      });
      fixit.util.forEach(originSwitchMobile.querySelectorAll('option'), (option) => {
        if (!option.getAttribute('value')) {
          return option.parentElement.removeChild(option);
        }
        option.dataset.type = 'artificial';
        option.innerText = `👤 ${option.innerText}`;
        option.disabled && option.removeAttribute('disabled');
      });
      if (this.hugoLangCodes.length > 1) {
        selectEl.prepend(...originSwitchMobile.querySelectorAll('option:not([selected])'));
        selectEl.prepend(originSwitchMobile.querySelector('option[selected]'));
      } else {
        const currentItem = document.createElement('option');
        currentItem.selected = true;
        currentItem.dataset.type = 'artificial';
        currentItem.value = window.location.pathname;
        currentItem.innerText = `👤 ${this.getLangNameById(this.lang.local)}`;
        selectEl.prepend(currentItem);
      }
      const { current, local, query } = this.lang;
      if (current !== local || query) {
        selectEl.value = current;
      }
      this.toggleVisibility(originSwitchMobile, false);
      this.toggleVisibility(switchMobile, true);
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
        this.getLangNameById(this.lang.browser) &&
        this.languages.length &&
        !this.languages.includes(this.lang.browser)
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
        link.classList.add('text-secondary')
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
