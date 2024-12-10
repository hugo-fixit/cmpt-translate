<!-- markdownlint-disable-file MD033 MD041 -->
# Auto Translate | FixIt

![auto-translate](https://github.com/user-attachments/assets/10ab49bb-973f-4630-9a79-9639783bab06)

<div align="center">
  <a href="/README.md">简体中文</a> |
  <a href="https://fixit.lruihao.cn/zh-cn/ecosystem/hugo-fixit/cmpt-translate/?lang=chinese_traditional" target="_blank">繁體中文</a> |
  English |
  <a href="https://fixit.lruihao.cn/ecosystem/hugo-fixit/cmpt-translate/?lang=french">Français</a> |
  <a href="https://fixit.lruihao.cn/ecosystem/hugo-fixit/cmpt-translate/?lang=russian">Русский язык</a> |
  <a href="https://fixit.lruihao.cn/ecosystem/hugo-fixit/cmpt-translate/?lang=spanish">Español</a> |
  <a href="https://fixit.lruihao.cn/ecosystem/hugo-fixit/cmpt-translate/?lang=hindi">हिन्दी</a> |
  <a href="https://fixit.lruihao.cn/ecosystem/hugo-fixit/cmpt-translate/?lang=german">deutsch</a> |
  <a href="https://fixit.lruihao.cn/ecosystem/hugo-fixit/cmpt-translate/?lang=korean">한국어</a> |
  <a href="https://fixit.lruihao.cn/ecosystem/hugo-fixit/cmpt-translate/?lang=japanese">しろうと</a>
</div>

A component for website automatic translation base on [translate.js](https://github.com/xnx3/translate).

## Demo

Whether the original site is multilingual or single-language, you can add automatic translation feature through this component.

- Multilingual Hugo site: [fixit.lruihao.cn](https://fixit.lruihao.cn)
- Single-language Hugo site: [lruihao.cn](https://lruihao.cn)

Switch the configured translation language in the upper right corner of the website, or add the `?lang=korean` parameter to the URL to specify any [supported translation language](https://api.translate.zvo.cn/language.json).

## Features

> No language configuration file, no API Key, SEO friendly!

- [x] Full page automatic translation
- [x] Specify translation language
- [x] Optional translation service
- [x] Ignore translation elements
- [x] Ignore keywords translation
- [x] Detect local language
- [x] Support CDN
- [x] Support [Enterprise Translation Channel](#enterprise) *

## Requirements

- Hugo v0.139.0 or later.
- FixIt v0.3.16 or later.

## Install Component

The installation method is the same as [installing a theme](https://fixit.lruihao.cn/documentation/installation/). There are several ways to install, choose one, Here are two mainstream ways.

### Install as Hugo Module

First make sure that your project itself is a [Hugo module](https://gohugo.io/hugo-modules/use-modules/#initialize-a-new-module).

Then add this theme component to your `hugo.toml` configuration file:

```toml
[module]
  [[module.imports]]
    path = "github.com/hugo-fixit/FixIt"
  [[module.imports]]
    path = "github.com/hugo-fixit/cmpt-translate"
```

On the first start of Hugo it will download the required files.

To update to the latest version of the module run:

```bash
hugo mod get -u
hugo mod tidy
```

### Install as Git Submodule

Clone [FixIt](https://github.com/hugo-fixit) and this git repository into your theme folder and add it as submodules of your website directory.

```bash
git submodule add https://github.com/hugo-fixit/FixIt.git themes/FixIt
git submodule add https://github.com/hugo-fixit/cmpt-translate.git themes/cmpt-translate
```

Next edit `hugo.toml` of your project and add this theme component to your themes:

```toml
theme = ["FixIt", "cmpt-translate"]
```

## Configuration

In order to Inject the partial `cmpt-translate.html` into the `custom-assets` through the [custom block](https://fixit.lruihao.cn/references/blocks/) opened by the FixIt theme in the `layouts/partials/custom.html` file, you need to fill in the following necessary configurations:

```toml
[params]
  [params.customPartials]
    head = []
    menuDesktop = [
      "inject/translate-menu-desktop.html",
    ]
    menuMobile = [
      "inject/translate-menu-mobile.html",
    ]
    profile = []
    aside = []
    comment = []
    footer = []
    widgets = []
    assets = [
      "inject/cmpt-translate.html",
    ]
    postFooterBefore = []
    postFooterAfter = []
```

In addition, you can customize the translated language through the following configuration:

```toml
[languages]
  [languages.en]
    languageCode = "en"
    languageName = "English"

[params]
  [params.autoTranslate]
    enable = true
    service = 'client.edge'
    languages = []
    ignoreID = []
    ignoreClass = []
    ignoreTag = []
    detectLocalLanguage = false
    cdn = ""
```

- `enable`: Whether to enable automatic translation.
- `service`: The translation service provider, optional values are `client.edge` and `translate.service`, see: [Translation Service Provider](https://translate.zvo.cn/43086.html).
- `languages`: List of language ID to translate to, e.g. `["english", "chinese_simplified", "chinese_traditional", ...]`, see the full language list: [Full Language List](https://api.translate.zvo.cn/language.json).
- `ignoreID`: Element IDs that needs to be ignored for translation, e.g. `["comment", ...]`
- `ignoreClass`: Class names that need to be ignored for translation, e.g. `["post-category", ...]`
- `ignoreTag`: Tag names that need to be ignored for translation, e.g. `["title", ...]`
- `ignoreText`: Texts that needs to be ignored for translation, e.g. `["FixIt", "Lruihao", ...]`
- `detectLocalLanguage`: Whether to detect the local language
- `cdn`: translate.js CDN
- `enterprise`: Whether to use the [enterprise translation channel](#enterprise)

> [!NOTE]
> To avoid translation language acquisition failure, even if your site itself is single-language, you need to configure `languageCode` and `languageName`, for example:
>
> ```toml
> [languages]
>   [languages.zh-cn]
>     languageCode = "en"
>     languageName = "English"
> ```

## Front Matter

- `local`: Used to specify the local language of the current page, e.g. `local: english`.
  
    The default local language is the same as the Hugo site configuration. If the actual language of a page is different from the site configuration, you can specify it through the `local` parameter.

<!-- markdownlint-disable-next-line MD033 -->
## Enterprise Translation Channel <a id="enterprise"></a>

> Enterprise-level stable translation channel, open only to **paying users**.\
> **Experience quota**: There is a daily experience quota of 50,000 characters, and the excess will no longer be translated!

Set `enterprise = true` in the configuration to enable the enterprise translation channel. The [enterprise translation channel](https://translate.zvo.cn/4087.html) has the following advantages over the ordinary translation channel:

| Service                      | Open source translation channel | Enterprise translation channel |
| :--------------------------- | :------------------------------ | :----------------------------- |
| Server cache layers          | 1 layer (file cache)            | 1 layer (memory + file cache)  |
| Translation response speed   | 1.5~5 seconds                   | 0.8~1.5 seconds                |
| Translation server           | 1                               | >=3                            |
| Network nodes                | 2                               | >=4                            |
| Translation channel          | Manual setting                  | Automatically match the best   |
| Domestic cache nodes         | None                            | Yes                            |
| Daily translation characters | 2 million                       | 50 million                     |

### Sponsorship fee

> Subsidy price for FixIt project: ~~¥50~~ **¥10** / domain name / month\
> Automatically disabled upon expiration, requiring re-sponsorship renewal.

Considering that most of the FixIt ecosystem audiences are individual users, I ([@Lruihao](https://github.com)) will use sponsorship income as a subsidy in my **personal name**, and provide **6 months of service/year** to each member of the [Hugo FixIt Planet](https://wx.zsxq.com/group/88888281181442?group_id=88888281181442&coupon_code=ks2qf5zd&inviter_id=15442515242512&inviter_sid=e15da0zzz4&keyword=BQcpe&type=group).

In addition, those who meet the following requirements can contact me for free to open an enterprise translation channel:

- [translate.js](https://github.com/xnx3/translate) and related ecological product developers
- [FixIt](https://github.com/hugo-fixit/FixIt) and related ecological product developers

### Sponsorship method

- [WeChat](https://lruihao.cn/images/wechatpay.jpg)
- [Alipay](https://lruihao.cn/images/alipay.jpg)

Choose the donation amount, and then remark `AutoTranslate: your domain name` in the message.

Contact the author through the following methods:

- Email: `1024#lruihao.cn` (replace `#` with `@`)
- WeChat: [Follow the official account and reply "Cell" to get the author's WeChat](https://lruihao.cn/images/qr-wx-mp_s.webp)

## Acknowledgements

[translate.js](https://github.com/xnx3/translate) provides technical support and sponsors [Enterprise Translation Channel](https://translate.zvo.cn/4087.html).
