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
  'katex',
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
    // 暂时关闭自动检测本地语言功能
    // this.detectLocalLanguage = detectLocalLanguage;
    // TODO
    // 期待结果：
    // 用户首次访问网站时，根据检测到的本地语言自动切换到对应的翻译，以后再次访问时，不再自动切换。
    // 1. 网站本身有对应的人工翻译直接跳到对应页面；
    // 2. 没有对应的人工翻译，使用机器翻译；
    this.detectLocalLanguage = false;

    this.isMobile = fixit.util.isMobile();
    this.afterTranslateEvents = new Set();
    this.lang = {
      current: translate.language.getCurrent(),
      local: window.ATConfig.local || translate.language.getLocal(),
      query: window.location.search.split('lang=')[1],
      browser: '',
    };
    this.supportLanguages = {
      'client.edge': translate.service.edge.language.json,
      'translate.service': supportLanguages,
    };
    this.hugoLangCodes = window.ATConfig.hugoLangCodes;
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
   * Toggle element visibility
   * @param {Element} el
   * @param {Boolean} visibility
   */
  toggleVisibility(el, visibility) {
    el.classList.toggle('d-none', !visibility);
    el.setAttribute('aria-hidden', !visibility);
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
    // this.#handleLocalLanguage();
    this.#handleArtificialItems();
    this.#handleMachineItems();
    // show the language switch and hide the origin switch
    const originSwitchDesktop = this.dom.switchDesktop.previousElementSibling;
    if (originSwitchDesktop.classList.contains('language-switch')) {
      this.toggleVisibility(originSwitchDesktop, false);
    }
    this.toggleVisibility(this.dom.switchDesktop, true);
  }

  /**
   * [WIP] Detect local language handling for desktop
   */
  #handleLocalLanguage() {
    if (this.detectLocalLanguage) {
      const langName = this.getLangNameById(this.lang.browser);
      const langCode = this.getLangCodeById(this.lang.browser);
      if (
        langName &&
        !this.hugoLangCodes.includes(langCode) &&
        !this.dom.switchMenu.querySelector(`[data-lang="${this.lang.browser}"]`)
      ) {
        const localItem = document.createElement('li');
        localItem.classList.add('menu-item');
        localItem.dataset.type = 'machine';
        localItem.innerHTML = `<a data-lang="${this.lang.browser}" class="menu-link" title="${langName}"><i class="fa-solid fa-robot fa-fw fa-sm" aria-hidden="true"></i> ${langName}</a>`;
        this.dom.switchMenu.insertBefore(localItem, this.dom.switchMenu.querySelector('.menu-item-divider').nextSibling);
      }
    }
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
        if (this.detectLocalLanguage) {
          translate.changeLanguage(this.lang.local);
        } else {
          translate.language.clearCacheLanguage();
        }
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
        // toggle active class
        machineItems.forEach((item) => {
          item.classList.remove('active');
        });
        item.classList.add('active');
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
    this.afterTranslateEvents.add(() => {
      this.dom.selectEl = this.dom.switchMobile.querySelector('select');
      this.dom.selectEl.classList.add('language-select');
      this.#handleMachineOptions();
      this.#handleArtificialOptions();
      // Set default translate-to language
      const { current, local, query } = this.lang;
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
    return Promise.resolve();
  }

  execute() {
    translate.execute();
    this.afterTranslateEvents.forEach((event) => {
      event();
    });
  }

  /**
   * Get user local language by browser or IP
   * @returns {Promise<void>}
   */
  async getBrowserLanguage() {
    this.lang.browser = translate.util.browserDefaultLanguage();
    let loading = true;
    if (!this.lang.browser) {
      translate.request.post(translate.request.api.ip, {}, (data) => {
        // console.log(data);
        if(data.result !== 0) {
          this.lang.browser = data.language;
          loading = false;
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
          if (this.detectLocalLanguage) {
            // add local language to the language list
            if (
              this.getLangNameById(this.lang.browser) &&
              this.languages.length &&
              !this.languages.includes(this.lang.browser)
            ) {
              this.languages.push(this.lang.browser);
            }
          }
          clearInterval(timer);
          resolve(this.lang.browser);
        }
      }, 100);
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

  /**
   * Init the AutoTranslate component
   * workflow:
   * 1. Setup the translate.js service
   * 2. Handle the language switch
   * 3. Execute automatic translation
   */
  init() {
    this.getBrowserLanguage().then((lang) => {
      // console.log(lang, this.languages);
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
