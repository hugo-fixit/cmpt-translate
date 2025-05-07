declare global {
  interface Window {
    ATConfig: any;
    fixit: any;
    translate: any;
  }
}

interface Language {
  current: string;
  local: string;
  query: string | null;
  browser: string;
}

interface TranslateTextParams {
  texts: string[];
  from: string;
  to: string;
}
declare const tianliGPT_postSelector: any;

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
  // @ts-ignore
} from '@params';

import {
  IGNORE_FIXIT,
  IGNORE_CMPTS,
  IGNORE_SELECTOR,
  IGNORE_TEXT,
} from './translate.config';

const {
  hugoLangCodes,
  hugoLangMap,
  fromLanguages,
  onlyLocalLang,
  nomenclature,
} = window.ATConfig;

const fixit = window.fixit;
const translate = window.translate;

/**
 * AutoTranslate Class
 * @description Auto translate website content by translate.js service.
 * @author [Lruihao](https://lruihao.cn)
 */
class AutoTranslate {
  // Get params from Hugo project config
  service: string = service;
  languages: string[] = languages;
  ignoreClass: string[] = [
    ...IGNORE_FIXIT,
    ...IGNORE_CMPTS,
    ...ignoreClass,
  ];
  ignoreID: string[] = ignoreID;
  ignoreTag: string[] = ignoreTag;
  ignoreSelector: string[] = [
    ...IGNORE_SELECTOR,
    ...ignoreSelector,
  ];
  ignoreText: string[] = [
    ...IGNORE_TEXT,
    ...ignoreText,
  ];
  detectLocalLanguage: boolean = detectLocalLanguage;
  enterprise: boolean = enterprise;
  isMobile: boolean = fixit.util.isMobile();
  afterExecuteEvents: Set<Function> = new Set();
  lang: Language = { ...this.getTypesLang() };
  supportLanguages: { [key: string]: any } = {
    'client.edge': translate.service.edge.language.json,
    'translate.service': supportLanguages,
  };
  hugoLangCodes: string[] = hugoLangCodes;
  hugoLangMap: { [key: string]: string } = hugoLangMap;
  fromLanguages: string[] = fromLanguages || [];
  onlyLocalLang: boolean = onlyLocalLang;
  nomenclature: any[] = nomenclature;
  dom: { [key: string]: any } = {};

  constructor() {
    //
  }

  /**
   * Get language name by language id from translate.js service
   * @param {String} id The language id, e.g. 'chinese_simplified'
   * @returns {String} The language name, e.g. '简体中文'
   */
  public getLangNameById(id: string): string | undefined {
    return this.supportLanguages[this.service]?.find((lang: any) => lang.id === id)?.name;
  }

  /**
   * Get browser language code by language id from translate.js service
   * @param {String} id The language id, e.g. 'chinese_simplified'
   * @returns {String} The language code, e.g. 'zh-CN'
   */
  public getLangCodeById(id: string): string {
    return Object.keys( translate.util.browserLanguage).find((code) => translate.util.browserLanguage[code] === id) || '';
  }

  /**
   * Get language id by browser language code
   * @param {String} code The language code, e.g. 'zh-CN'
   * @returns {String} The language id, e.g. 'chinese_simplified'
   */
  public getLangIdByCode(code: string): string | undefined {
    return translate.util.browserLanguage[code];
  }

  /**
   * Get language types
   * @returns {Object} The language types
   */
  public getTypesLang(): Language {
    return {
      current: translate.language.getCurrent(),
      local: window.ATConfig.local || translate.language.getLocal(),
      query: window.location.search.split('lang=')[1],
      browser: this.lang?.browser || '',
    };
  }

  /**
   * Toggle element visibility
   * @param {HTMLElement} el
   * @param {Boolean} visibility
   */
  public toggleVisibility(el: HTMLElement, visibility: boolean): void {
    el.classList.toggle('d-none', !visibility);
    el.setAttribute('aria-hidden', !visibility + '');
  }

  /**
   * Toggle active class for language switch menu
   * @param {HTMLElement} el
   */
  public toggleMenuActive(el: HTMLElement): void {
    // remove active class from all items
    Array.from(this.dom.switchMenu.childNodes as NodeListOf<HTMLElement>)
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
  public handleDesktop(): void {
    this.dom.switchDesktop = document.querySelector('#header-desktop .language-switch.auto');
    if (!this.dom.switchDesktop) {
      return;
    }
    this.dom.switchMenu = this.dom.switchDesktop.querySelector('.sub-menu');
    this.dom.localItems && this.dom.switchMenu.append(...this.dom.localItems);
    this.handleArtificialItems();
    this.handleMachineItems();
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
        const menuLink = document.querySelector(`.menu-link[data-lang="${current}"]`);
        if (menuLink && menuLink.parentElement) {
          this.toggleMenuActive(menuLink.parentElement);
        }
      }
    });
  }

  /**
   * Handle Hugo project artificial language items for desktop
   */
  private handleArtificialItems(): void {
    const artificialItems = Array.from(this.dom.switchMenu.childNodes as NodeListOf<HTMLElement>).filter((node) => node.dataset.type === 'artificial');
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
  private handleMachineItems(): void {
    const machineItems = Array.from(this.dom.switchMenu.childNodes as NodeListOf<HTMLElement>).filter((node) => node.dataset.type === 'machine');
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
  public handleMobile(): void {
    this.dom.switchMobile = document.querySelector('#header-mobile .language-switch.auto');
    if (!this.dom.switchMobile) {
      return;
    }
    this.selectOnChangeMobile();
    this.afterExecuteEvents.add(() => {
      new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          this.dom.selectEl = this.dom.switchMobile.querySelector('select');
          if (this.dom.selectEl) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      }).then(() => {
        this.dom.selectEl.classList.add('language-select');
        this.handleMachineOptions();
        this.handleArtificialOptions();
        // Set default translate-to language
        const { current, local, query } = this.getTypesLang();
        this.lang = { ...this.lang, current, query };
        if (current !== local || query) {
          this.dom.selectEl.value = current;
        }
        this.toggleVisibility(this.dom.switchMobile, true);
      });
    });
  }

  private selectOnChangeMobile(): void {
    translate.selectLanguageTag.selectOnChange = (e) => {
      const lang = e.target.value;
      if (e.target.options[e.target.selectedIndex].dataset.type === 'artificial') {
        // Artificial language items by Hugo project
        translate.language.clearCacheLanguage();
        window.location = lang;
      } else {
        // Machine language items by translate.js service
        window.history.pushState({}, '', `?lang=${lang}`);
        translate.changeLanguage(lang);
      }
    };
  }

  private handleMachineOptions(): void {
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

  private handleArtificialOptions(): void {
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
    // multilingual site missing translations
    if (originSwitchMobile.classList.contains('language-switch')) {
      this.toggleVisibility(originSwitchMobile, false);
    }
  }

  public handle(): this {
    if (this.isMobile) {
      this.handleMobile();
    } else {
      this.handleDesktop();
    }
    return this;
  }

  public setup(): this {
    if (this.enterprise) {
      // Use the enterprise-level translation channel
      // automatically switch to the best translation service
      translate.enterprise.use();
    } else {
      translate.service.use(this.service);
    }
    document.querySelectorAll(this.ignoreSelector.join(',')).forEach((el) => {
      el.classList.add('fi-at-ignore');
    });
    // add custom nomenclature for translation
    this.nomenclature?.forEach((item) => {
      translate.nomenclature.append(
        item.from,
        item.to,
        Object.keys(item.properties).map((key) => `${key}=${item.properties[key]}`).join('\n'),
      );
    });
    if (this.onlyLocalLang) {
      this.fromLanguages = [this.lang.local];
    }
    translate.language.translateLanguagesRange = this.fromLanguages;
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

  public execute(): void {
    translate.execute();
    this.afterExecuteEvents.forEach((event) => {
      event();
    });
  }

  /**
   * Translate the AI summary from local to current language
   */
  public translateAISummary(): void {
    const { current, local } = this.getTypesLang();
    if (typeof tianliGPT_postSelector === 'undefined' || current === local) {
      return;
    }
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          const summary = document.querySelector('.tianliGPT-explanation');
          let cursor;
          if (summary) {
            cursor = summary.querySelector('.blinking-cursor');
            cursor && summary.classList.add('fi-at-ignore');
          }
          if (!summary || cursor) {
            return;
          }
          summary.classList.remove('fi-at-ignore');
        }
      }
    });
    observer.observe(document.getElementById('content') as HTMLElement, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Translate text by translate.js service
   * @param {Object} param
   * @param {Array<string>} param.texts The texts to be translated
   * @param {string} param.from The original language code
   * @param {string} param.to The target language code
   * @returns 
   */
  public translateText({ texts, from, to }: TranslateTextParams): Promise<string> {
    return new Promise((resolve) => {
      translate.request.translateText({
        from,
        to,
        texts,
      }, (data: any) => {
        // success
        if (data.result === 1) {
          resolve(data.text[0]);
          return;
        }
        // error
        console.error('Translate text error:', data.info);
        resolve(data.info);
      });
    });
  }

  /**
   * Get user local language by browser or IP
   * @returns {Promise<string>} The user local language
   */
  public async getBrowserLanguage(): Promise<string> {
    let lang = translate.util.browserDefaultLanguage();
    let loading = true;
    if (!lang) {
      translate.request.post(translate.request.api.ip, {}, (data: any) => {
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

  public addLangItem(langId: string): boolean {
    if (!langId) {
      return false;
    }
    const langName = this.getLangNameById(langId);
    const langCode = this.getLangCodeById(langId);
    if (
      langName &&
      !this.hugoLangCodes.includes(langCode) &&
      this.languages.length &&
      !this.languages.includes(langId)
    ) {
      this.languages.push(langId);
      const langItem = document.createElement('li');
      langItem.classList.add('menu-item');
      langItem.dataset.type = 'machine';
      langItem.innerHTML = `<a data-lang="${langId}" class="menu-link" title="${langName}"><i class="fa-solid fa-robot fa-fw fa-sm" aria-hidden="true"></i> ${langName}</a>`;
      this.dom.localItems = this.dom.localItems ? [...this.dom.localItems, langItem] : [langItem];
      return true;
    }
    return false;
  }

  /**
   * Auto discriminate local language
   */
  public autoSelectLocalLanguage(): void {
    this.addLangItem(this.lang.query || this.lang.current);
    if (!this.detectLocalLanguage) {
      return;
    }
    const AutoDetected = localStorage.getItem('AutoTranslate_detected');
    if (this.addLangItem(this.lang.browser)) {
      if (AutoDetected !== 'true' && !this.lang.query) {
        translate.language.setDefaultTo(this.lang.browser);
        localStorage.setItem('AutoTranslate_detected', 'true');
      }
      return;
    }
    // Redirect to the corresponding page
    if (AutoDetected !== 'true' && !this.lang.query) {
      const langCode = this.getLangCodeById(this.lang.browser);
      if (
        this.hugoLangCodes.includes(langCode) &&
        !window.location.pathname.includes(this.hugoLangMap[langCode])
      ) {
        window.location.assign(this.hugoLangMap[langCode]);
      } 
      localStorage.setItem('AutoTranslate_detected', 'true');
    }
    return;
  }

  public clearCache(): void {
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
  public init(): void {
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
      this.translateAISummary();
    });
  }
}

fixit.autoTranslate = new AutoTranslate();

if (document.readyState !== 'loading') {
  fixit.autoTranslate.init();
} else {
  document.addEventListener('DOMContentLoaded', () => fixit.autoTranslate.init(), false);
}
