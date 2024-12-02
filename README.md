# {component-xxx}

👉 English README | [简体中文说明](/README.zh-cn.md)

TODO description here if needed

## Demo

TODO demo here if needed

## Requirements

- FixIt v0.3.12 or later.

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
    path = "github.com/hugo-fixit/{component-xxx}"
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
git submodule add https://github.com/hugo-fixit/{component-xxx}.git themes/{component-xxx}
```

Next edit `hugo.toml` of your project and add this theme component to your themes:

```toml
theme = ["FixIt", "{component-xxx}"]
```

## Configuration

In order to Inject the partial `{component-xxx}.html` into the `custom-assets` through the [custom block](https://fixit.lruihao.cn/references/blocks/) opened by the FixIt theme in the `layouts/partials/custom.html` file, you need to fill in the following necessary configurations:

```toml
[params]
  [params.customPartials]
    head = []
    profile = []
    aside = []
    comment = []
    footer = []
    widgets = []
    assets = [
      "inject/{component-xxx}.html",
    ]
    postFooterBefore = []
    postFooterAfter = []
```

TODO configuration here if needed ...

## Use Shortcode

Here is an example of usage:

```markdown
{{< shortcode-xxx >}}
```

## References

- [Develop Theme Components | FixIt](https://fixit.lruihao.cn/contributing/components/)
- [How to Develop a Hugo Theme Component | FixIt](https://fixit.lruihao.cn/components/dev-component/)
