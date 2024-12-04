# cmpt-translate

👉 English README | [简体中文说明](/README.zh-cn.md)

A component for website automatic translation base on [translate.js](https://github.com/xnx3/translate).

## Demo

Whether the original site is multilingual or single-language, you can add automatic translation feature through this component.

- Multilingual Hugo site: [fixit.lruihao.cn](https://fixit.lruihao.cn)
- Single-language Hugo site: [lruihao.cn](https://lruihao.cn)

## Requirements

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
[params]
  [params.autoTranslate]
    enable = true
    service = 'client.edge'
    languages = []
    ignoreID = []
    ignoreClass = []
    ignoreTag = []
    detectLocalLanguage = false
```

- `enable`: Whether to enable automatic translation.
- `service`: The translation service provider, optional values are `client.edge` and `translate.service`, see: [Translation Service Provider](https://translate.zvo.cn/43086.html).
- `languages`: List of language ID to translate to, e.g. `["english", "chinese_simplified", "chinese_traditional", ...]`, see the full language list: [Full Language List](https://api.translate.zvo.cn/language.json).
- `ignoreID`: Element IDs that needs to be ignored for translation.
- `ignoreClass`: Class names that need to be ignored for translation.
- `ignoreTag`: Tag names that need to be ignored for translation.
- `detectLocalLanguage`: Whether to detect the local language.

## Acknowledgements

- [translate.js](https://github.com/xnx3/translate)

## References

- [Develop Theme Components | FixIt](https://fixit.lruihao.cn/contributing/components/)
- [How to Develop a Hugo Theme Component | FixIt](https://fixit.lruihao.cn/components/dev-component/)
