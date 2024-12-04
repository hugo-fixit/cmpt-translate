# cmpt-translate

👉 简体中文说明 | [English README](/README.md)

一个基于 [translate.js](https://github.com/xnx3/translate) 实现网站自动翻译的组件。

## Demo

无论原站点是多语言还是单语言，都可以通过此组件额外增加自动翻译功能。

- 多语言 Hugo 站点：[fixit.lruihao.cn](https://fixit.lruihao.cn)
- 单语言 Hugo 站点：[lruihao.cn](https://lruihao.cn)

## 要求

- FixIt v0.3.16 或更高版本。

## 安装组件

安装方式与 [安装主题](https://fixit.lruihao.cn/zh-cn/documentation/installation/) 相同，有多种安装方式，任选一种即可，这里介绍两种主流方式。

### 作为 Hugo 模块安装

首先确保你的项目本身是一个 [Hugo 模块](https://gohugo.io/hugo-modules/use-modules/#initialize-a-new-module)。

然后将此主题组件添加到你的 `hugo.toml` 配置文件中：

```toml
[module]
  [[module.imports]]
    path = "github.com/hugo-fixit/FixIt"
  [[module.imports]]
    path = "github.com/hugo-fixit/cmpt-translate"
```

在 Hugo 的第一次启动时，它将下载所需的文件。

要更新到模块的最新版本，请运行：

```bash
hugo mod get -u
hugo mod tidy
```

### 作为 Git 子模块安装

将 [FixIt](https://github.com/hugo-fixit) 和此 git 存储库克隆到你的主题文件夹中，并将其作为网站目录的子模块添加。

```bash
git submodule add https://github.com/hugo-fixit/FixIt.git themes/FixIt
git submodule add https://github.com/hugo-fixit/cmpt-translate.git themes/cmpt-translate
```

接下来编辑项目的 `hugo.toml` 并将此主题组件添加到你的主题中：

```toml
theme = ["FixIt", "cmpt-translate"]
```

## 配置

为了通过 FixIt 主题在 `layouts/partials/custom.html` 文件中开放的 [自定义块](https://fixit.lruihao.cn/references/blocks/) 将 `cmpt-translate.html` 注入到 `custom-assets` 中，你需要填写以下必要配置：

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

另外，你还可以通过以下配置来自定义翻译的语言：

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

- `enable`：是否启用自动翻译。
- `service`：翻译服务提供商，可选值为 `client.edge` 和 `translate.service`，详见：[翻译服务提供商](https://translate.zvo.cn/43086.html)。
- `languages`：要翻译到的语言 ID 列表，例如 `["english", "chinese_simplified", "chinese_traditional", ...]`，详见：[完整语言列表](https://api.translate.zvo.cn/language.json)。
- `ignoreID`：需要忽略翻译的元素 ID。
- `ignoreClass`：需要忽略翻译的类名。
- `ignoreTag`：需要忽略翻译的标签。
- `detectLocalLanguage`：是否检测本地语言。

## 致谢

- [translate.js](https://github.com/xnx3/translate)

## 参考

- [开发主题组件 | FixIt](https://fixit.lruihao.cn/contributing/components/)
- [如何开发 Hugo 主题组件 | FixIt](https://fixit.lruihao.cn/components/dev-component/)
