import type { View } from '../../interface/view';
import { createElement } from '../../../utils/create-html';

export class Form implements View {
  private html: HTMLElement;
  private btn: HTMLButtonElement;

  constructor(text: string) {
    this.html = this.createView(text);
    this.btn = this.html.querySelector('button') as HTMLButtonElement;
  }

  getHtml() {
    return this.html;
  }

  getBtn() {
    return this.btn;
  }

  private createView(text: string) {
    const element = createElement({ tag: 'form', css: ['form'] });
    element.id = `${text}-form`;
    const nameInput = createElement({ tag: 'input', text: 'name' });
    nameInput.type = 'text';
    nameInput.setAttribute('required', 'true');
    nameInput.id = `${text}-name`;
    const colorInput = createElement({ tag: 'input', text: 'color' });
    colorInput.type = 'color';
    colorInput.setAttribute('required', 'true');
    colorInput.id = `${text}-color`;
    const submitButton = createElement({ tag: 'button', text: `${text}` });
    submitButton.type = 'submit';
    submitButton.id = `${text}-submit`;

    element.append(nameInput, colorInput, submitButton);

    return element;
  }
}
