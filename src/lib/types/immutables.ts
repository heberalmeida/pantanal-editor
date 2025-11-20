/**
 * Immutables configuration types
 * Immutables are elements that cannot be edited but can be serialized/deserialized
 */

export interface ImmutablesProps {
  deserialization?: (viewElement: HTMLElement, immutableElement: HTMLElement) => HTMLElement;
  serialization?: string | ((immutableElement: HTMLElement) => string);
}

export interface ImmutableElement {
  element: HTMLElement;
  original: HTMLElement;
}




