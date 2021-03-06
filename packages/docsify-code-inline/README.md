[npm]: https://img.shields.io/npm/v/@rakutentech/docsify-code-inline
[npm-url]: https://www.npmjs.com/package/@rakutentech/docsify-code-inline
[size]: https://packagephobia.now.sh/badge?p=@rakutentech/docsify-code-inline
[size-url]: https://packagephobia.now.sh/result?p=@rakutentech/docsify-code-inline
[docsify]: https://docsify.js.org/
[docsify-themeable]: https://jhildenbiddle.github.io/docsify-themeable/

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @rakutentech/docsify-code-inline

A [Docsify][docsify] plugin that enables syntax highlighting for inline code.

## Install

The plugin automatically loads itself, unless the `data-no-autoload` attribute is set. It also automatically injects CSS in the DOM, unless the `data-no-css-inject` attribute is set:

<!-- prettier-ignore -->
```html
<!-- autoloads, injects CSS -->
<script
  src="//unpkg.com/@rakutentech/docsify-code-inline/dist/index.min.js"
></script>

<!-- autoloads, doesn't inject CSS -->
<script
  src="//unpkg.com/@rakutentech/docsify-code-inline/dist/index.min.js"
  data-no-css-inject
></script>

<!-- doesn't load, doesn't inject CSS -->
<script
  src="//unpkg.com/@rakutentech/docsify-code-inline/dist/index.min.js"
  data-no-autoload
  data-no-css-inject
></script>
```

You can also import it as an ES module, if using the `.esm` build:

```html
<script type="module" src="//unpkg.com/@rakutentech/docsify-code-inline/dist/index.esm.min.js"></script>
```

The module also supports Node. See the API below.

```sh
npm install --save-dev @rakutentech/docsify-code-inline
```

## Usage

```text
If you wrap `code` with square brackets and add a language identifier, e.g.
[`<link href="foo">` html], then the produced markup will enable syntax
highlighting using PrismJS like in code fences.
```

…gets transformed by this plugin into:

```html
If you wrap `code` with square brackets and add a language identifier, e.g. <code class="language-html">&lt;link href="foo"&gt;</code>, then the produced markup will
enable syntax highlighting using PrismJS like in code fences.
```

…which produces the following DOM tree when PrismJS is active and supports HTML:

<!-- prettier-ignore -->
```html
<p>
  If you wrap
  <code>
    code
  </code>
  with square brackets and add a language identifier, e.g.
  <code class="language-html">
    <span class="token tag">
      <span class="token tag">
        <span class="token punctuation">
          &lt;
        </span>
        link
      </span>

      <span class="token attr-name">
        href
      </span>
      <span class="token attr-value">
        <span class="token punctuation attr-equals">
          =
        </span>
        <span class="token punctuation">
          "
        </span>
        foo
        <span class="token punctuation">
          "
        </span>
      </span>
      <span class="token punctuation">
        &gt;
      </span>
    </span>
  </code>
  , then the produced markup will enable syntax highlighting using PrismJS like in code fences.
</p>
```

## Styling

The plugin uses the styles defined by [`docsify-themeable`][docsify-themeable].

## Typescript

Types are included in the library.

## API

Two things are exported:

- `const DEFAULT_CSS: string`, the CSS rules that are normally added to the DOM when the library is loaded in a browser and `data-no-css-inject` not used.
- `function transform(markdown: string): string`, the method used by the plugin to replace inline code with syntax-highlighted spans in a markdown document.

## License

[MIT](LICENSE)
