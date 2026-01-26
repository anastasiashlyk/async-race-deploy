export type ElementParameters<K extends keyof HTMLElementTagNameMap> = {
  tag: K;
  text?: string;
  css?: Array<string>;
};

export function createElement<K extends keyof HTMLElementTagNameMap>(
  parameters: ElementParameters<K>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(parameters.tag);

  if (parameters.text) {
    element.textContent = parameters.text;
  }

  if ('css' in parameters && Array.isArray(parameters.css)) {
    element.classList.add(...parameters.css);
  }

  return element;
}
