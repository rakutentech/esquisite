interface Hook {
  beforeEach: (fn: (content: string) => string) => void;
}

type Plugin = (hook: Hook) => void;

interface PluginHolder {
  plugins?: Plugin[];
}

declare global {
  let $docsify: PluginHolder;
}

// Core

export function transform(markdown: string): string {
  const RE = /\[`(.*?)(?<!\\(\\{2})*)`\s+([a-z0-9-]+?)\](?!\()/g;
  return markdown.replace(RE, (_, code, __, lang) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<code class="language-${lang}">${escaped}</code>`;
  });
}

export const DEFAULT_CSS = `
.markdown-section :not(pre) > code[class*="language-"] {
  background: var(--code-theme-background);
  margin: var(--code-inline-margin);
  padding: var(--code-inline-padding);
  border-radius: var(--code-inline-border-radius);
  color: var(--code-inline-color, currentColor);
}
`;

// Plugin registration and CSS injection need a DOM
if (typeof document !== 'undefined') {
  // Register the plugin automatically, unless <script data-no-autoload> was used
  if (typeof document.currentScript?.dataset?.noAutoload === 'undefined') {
    const inlineCode: Plugin = (hook: Hook) => {
      hook.beforeEach((content) => transform(content));
    };
    $docsify = $docsify || {};
    $docsify.plugins = $docsify.plugins || [];
    $docsify.plugins.push(inlineCode);
  }

  // Add CSS automatically, unless <script data-no-css-inject> was used
  if (typeof document.currentScript?.dataset?.noCssInject === 'undefined') {
    document.head
      .insertBefore(document.createElement('style'), document.head.firstElementChild)
      .appendChild(document.createTextNode(DEFAULT_CSS));
  }
}
