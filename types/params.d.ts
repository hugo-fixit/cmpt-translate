/**
 * Hugo @params type declarations
 * This file provides TypeScript type definitions for Hugo's @params module
 */

declare module '@params' {
  export const detectLocalLanguage: boolean
  export const enterprise: boolean
  export const ignoreClass: string[]
  export const ignoreID: string[]
  export const ignoreSelector: string[]
  export const ignoreTag: string[]
  export const ignoreText: string[]
  export const languages: string[]
  export const service: string
  export const supportLanguages: { [key: string]: any }
}
