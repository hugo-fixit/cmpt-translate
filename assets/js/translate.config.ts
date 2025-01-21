/**
 * Ignore class list for the Fixit theme
 * 'fi-at-ignore' is a common class for hugo-fixit theme and components
 * @type {Array<string>}
 */
export const IGNORE_FIXIT = [
  'fi-at-ignore',
  'header-title',
  'language-switch',
  'post-author',
  'powered',
  'author',
  'typeit',
  'katex',
  'katex-display',
  'message-content',
]

/**
 * Ignore class list for the hugo-fixit components
 * @type {Array<string>}
 */
export const IGNORE_CMPTS = [
  // hugo-fixit/component-projects
  'repo-url',
  'repo-visibility',
  'repo-lang',
  // hugo-fixit/shortcode-mmt-netease
  'netease-music',
  'comment-163',
]

/**
 * Ignore selector list for hugo-fixit theme and components
 * @type {Array<string>}
 */
export const IGNORE_SELECTOR = [
  // hugo-fixit/component-projects
  '[data-adapters="projects"] .single-subtitle',
]

/**
 * Ignore text list for Fixit theme
 * @type {Array<string>}
 */
export const IGNORE_TEXT = [
  'Hugo',
  'FixIt',
  'hugo-fixit',
  'Lruihao',
  'shortcode',
  'CC BY-NC-SA',
  'RSS',
]

/**
 * Add translation for the specified tag attributes
 * https://translate.zvo.cn/231504.html
 */
// translate.element.tagAttribute['input']=['value','data-value'];

export default {
  IGNORE_FIXIT,
  IGNORE_CMPTS,
  IGNORE_SELECTOR,
  IGNORE_TEXT,
}
