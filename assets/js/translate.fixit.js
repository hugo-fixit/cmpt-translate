import {
  service,
  languages,
  ignoreID,
  ignoreClass,
  ignoreTag,
  ignoreSelector,
  ignoreText,
  detectLocalLanguage,
  supportLanguages,
  enterprise,
} from '@params';

import {
  IGNORE_FIXIT,
  IGNORE_CMPTS,
  IGNORE_SELECTOR,
  IGNORE_TEXT,
} from './config';

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
    this.ignoreSelector = [
      ...IGNORE_SELECTOR,
      ...ignoreSelector,
    ];
    this.ignoreText = [
      ...IGNORE_TEXT,
      ...ignoreText,
    ];
    this.detectLocalLanguage = detectLocalLanguage;
    this.enterprise = enterprise;

    this.isMobile = fixit.util.isMobile();
    this.afterExecuteEvents = new Set();
    this.lang = { ...this.getTypesLang() };
    this.supportLanguages = {
      'client.edge': translate.service.edge.language.json,
      'translate.service': supportLanguages,
    };
    this.hugoLangCodes = window.ATConfig.hugoLangCodes;
    this.hugoLangMap = window.ATConfig.hugoLangMap;
    this.dom = {};
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
   * Get language types
   * @returns {Object} The language types
   */
  getTypesLang() {
    return {
      current: translate.language.getCurrent(),
      local: window.ATConfig.local || translate.language.getLocal(),
      query: window.location.search.split('lang=')[1],
      browser: this.lang?.browser || '',
    };
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

  /**
   * Toggle active class for language switch menu
   * @param {Element} el
   */
  toggleMenuActive(el) {
    // remove active class from all items
    Array.from(this.dom.switchMenu.childNodes)
      .filter((node) => node.classList.contains('active'))
      .forEach((item) => {
        item.classList.remove('active');
      });
    // add active class to the selected item
    el.classList.add('active');
  }

  /**
   * Handle desktop language switch
   */
  handleDesktop() {
    this.dom.switchDesktop = document.querySelector('#header-desktop .language-switch.auto');
    if (!this.dom.switchDesktop) {
      return;
    }
    this.dom.switchMenu = this.dom.switchDesktop.querySelector('.sub-menu');
    if (this.dom.localItem) {
      this.dom.switchMenu.insertBefore(
        this.dom.localItem,
        this.dom.switchMenu.querySelector('.menu-item-divider').nextSibling
      );
    }
    this.#handleArtificialItems();
    this.#handleMachineItems();
    // show the language switch and hide the origin switch
    const originSwitchDesktop = this.dom.switchDesktop.previousElementSibling;
    if (originSwitchDesktop.classList.contains('language-switch')) {
      this.toggleVisibility(originSwitchDesktop, false);
    }
    this.toggleVisibility(this.dom.switchDesktop, true);
    this.afterExecuteEvents.add(() => {
      this.lang = { ...this.getTypesLang() };
      // Set default translate-to language (only machine translation)
      const { current, local, query } = this.getTypesLang();
      this.lang = { ...this.lang, current, query };
      if (current !== local || query) {
        this.toggleMenuActive(document.querySelector(`.menu-link[data-lang="${current}"]`).parentElement);
      }
    });
  }

  /**
   * Handle Hugo project artificial language items for desktop
   */
  #handleArtificialItems() {
    const artificialItems = Array.from(this.dom.switchMenu.childNodes).filter((node) => node.dataset.type === 'artificial');
    fixit.util.forEach(artificialItems, (item) => {
      if (item.classList.contains('active') && !item.children[0].getAttribute('title')) {
        const langName = this.getLangNameById(this.lang.local);
        item.children[0].setAttribute('title', langName);
        item.children[0].insertAdjacentText('beforeend', langName);
      }
      item.addEventListener('click', (e) => {
        translate.language.clearCacheLanguage();
      });
    });
  }

  /**
   * Handle translate.js machine language items for desktop
   */
  #handleMachineItems() {
    const machineItems = Array.from(this.dom.switchMenu.childNodes).filter((node) => node.dataset.type === 'machine');
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
      if (this.hugoLangCodes.includes(langCode) || langId == this.lang.local) {
        this.toggleVisibility(item, false);
        return;
      }
      item.addEventListener('click', (e) => {
        // set query param 'lang' to url
        window.history.pushState({}, '', `?lang=${langId}`);
        this.toggleMenuActive(item);
        // translate to selected language
        translate.changeLanguage(langId);
      });
    });
  }

  /**
   * Handle mobile language switch
   */
  handleMobile() {
    this.dom.switchMobile = document.querySelector('#header-mobile .language-switch.auto');
    if (!this.dom.switchMobile) {
      return;
    }
    this.#selectOnChangeMobile();
    this.afterExecuteEvents.add(() => {
      this.dom.selectEl = this.dom.switchMobile.querySelector('select');
      this.dom.selectEl.classList.add('language-select');
      this.#handleMachineOptions();
      this.#handleArtificialOptions();
      // Set default translate-to language
      const { current, local, query } = this.getTypesLang();
      this.lang = { ...this.lang, current, query };
      if (current !== local || query) {
        this.dom.selectEl.value = current;
      }
      this.toggleVisibility(this.dom.switchMobile, true);
    });
  }

  #selectOnChangeMobile() {
    translate.selectLanguageTag.selectOnChange = (e) => {
      const lang = e.target.value;
      if (e.target.options[e.target.selectedIndex].dataset.type === 'artificial') {
        // Artificial language items by Hugo project
        translate.language.clearCacheLanguage();
        window.location = lang
      } else {
        // Machine language items by translate.js service
        window.history.pushState({}, '', `?lang=${lang}`);
        translate.changeLanguage(lang);
      }
    };
  }

  #handleMachineOptions() {
    fixit.util.forEach(this.dom.selectEl.querySelectorAll('option'), (option) => {
      option.dataset.type = 'machine';
      option.innerText = `🤖 ${option.innerText}`;
      const langCode = this.getLangCodeById(option.value);
      if (this.hugoLangCodes.includes(langCode) || option.value == this.lang.local) {
        // Safari can not use "display: none;" for option. (Safari sucks!!!)
        // this.toggleVisibility(option, false);
        option.parentElement.removeChild(option);
      }
    });
  }

  #handleArtificialOptions() {
    const originSwitchMobile = this.dom.switchMobile.previousElementSibling;
    // multilingual handling
    if (this.hugoLangCodes.length > 1) {
      fixit.util.forEach(originSwitchMobile.querySelectorAll('option'), (option) => {
        if (!option.getAttribute('value')) {
          return option.parentElement.removeChild(option);
        }
        option.dataset.type = 'artificial';
        option.innerText = `👤 ${option.innerText}`;
        option.disabled && option.removeAttribute('disabled');
      });
      this.dom.selectEl.prepend(...originSwitchMobile.querySelectorAll('option:not([selected])'));
      this.dom.selectEl.prepend(originSwitchMobile.querySelector('option[selected]'));
      this.toggleVisibility(originSwitchMobile, false);
      return;
    }
    // single-language handling
    const selectBtn = this.dom.switchMobile.querySelector('[role="button"]');
    const langName = this.getLangNameById(this.lang.local);
    if (!selectBtn.dataset.current) {
      selectBtn.dataset.current = langName;
      selectBtn.insertAdjacentText('afterbegin', langName);
    }
    const currentItem = document.createElement('option');
    currentItem.selected = true;
    currentItem.dataset.type = 'artificial';
    currentItem.value = window.location.pathname;
    currentItem.innerText = `👤 ${langName}`;
    this.dom.selectEl.prepend(currentItem);
    this.toggleVisibility(originSwitchMobile, false);
  }

  handle() {
    if (this.isMobile) {
      this.handleMobile();
    } else {
      this.handleDesktop();
    }
    return this;
  }

  setup() {
    /**
     * Use the enterprise-level translation channel
     * automatically switch to the best translation service
     */
    if (this.enterprise) {
      translate.enterprise.use();
    } else {
      translate.service.use(this.service);
    }
    document.querySelectorAll(this.ignoreSelector.join(',')).forEach((el) => {
      el.classList.add('fi-at-ignore');
    });
    translate.ignore.id.push(...this.ignoreID);
    translate.ignore.class.push(...this.ignoreClass);
    translate.ignore.tag.push(...this.ignoreTag);
    translate.ignore.text.push(...this.ignoreText);
    translate.language.setLocal(this.lang.local);
    translate.language.setUrlParamControl('lang');
    translate.listener.start();
    translate.selectLanguageTag.show = this.isMobile;
    translate.selectLanguageTag.languages = this.languages.join(',');
    return this;
  }

  execute() {
    translate.execute();
    this.afterExecuteEvents.forEach((event) => {
      event();
    });
  }

  /**
   * Get user local language by browser or IP
   * @returns {Promise<string>} The user local language
   */
  async getBrowserLanguage() {
    let lang = translate.util.browserDefaultLanguage();
    let loading = true;
    if (!lang) {
      translate.request.post(translate.request.api.ip, {}, (data) => {
        // console.log(data);
        loading = false;
        if(data.result !== 0) {
          lang = data.language;
          return;
        }
        console.log('Can not get the language by ip', data.info);
      });
    } else {
      loading = false;
    }
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (!loading) {
          clearInterval(timer);
          resolve(lang);
        }
      }, 100);
    });
  }

  /**
   * Auto discriminate local language
   */
  autoSelectLocalLanguage() {
    if (!this.detectLocalLanguage) {
      return;
    }
    const langName = this.getLangNameById(this.lang.browser);
    const langCode = this.getLangCodeById(this.lang.browser);
    const AutoDetected = localStorage.getItem('AutoTranslate_detected');
    if (
      langName &&
      !this.hugoLangCodes.includes(langCode) &&
      this.languages.length &&
      !this.languages.includes(this.lang.browser)
    ) {
      this.languages.push(this.lang.browser);
      this.dom.localItem = document.createElement('li');
      this.dom.localItem.classList.add('menu-item');
      this.dom.localItem.dataset.type = 'machine';
      this.dom.localItem.innerHTML = `<a data-lang="${this.lang.browser}" class="menu-link" title="${langName}"><i class="fa-solid fa-robot fa-fw fa-sm" aria-hidden="true"></i> ${langName}</a>`;
      if (AutoDetected !== 'true') {
        translate.language.setDefaultTo(this.lang.browser);
        localStorage.setItem('AutoTranslate_detected', true);
      }
      return;
    }
    // Redirect to the corresponding page
    if (
      AutoDetected !== 'true' &&
      this.hugoLangCodes.includes(langCode) &&
      !window.location.pathname.includes(this.hugoLangMap[langCode])
    ) {
      window.location = this.hugoLangMap[langCode];
    }
    if (AutoDetected !== 'true') {
      localStorage.setItem('AutoTranslate_detected', true);
    }
    return;
  }

  clearCache() {
    localStorage.removeItem('AutoTranslate_detected');
    translate.language.clearCacheLanguage();
  }

  /**
   * Init the AutoTranslate component
   * workflow:
   * 1. Setup the translate.js service
   * 2. Handle the language switch
   * 3. Execute automatic translation
   */
  init() {
    this.getBrowserLanguage().then((lang) => {
      // console.log(lang);
      if (!lang) {
        this.detectLocalLanguage = false;
      }
      this.lang.browser = lang;
      this.autoSelectLocalLanguage();
      this.setup();
      this.handle();
      this.execute();
    });
  }
}

fixit.autoTranslate = new AutoTranslate();

if (document.readyState !== 'loading') {
  fixit.autoTranslate.init();
} else {
  document.addEventListener('DOMContentLoaded', () => fixit.autoTranslate.init(), false);
}
