import { Mediator, AppEventsNames } from '../../core/mediator';
import type { View } from '../interface/view';
import { createElement } from '../../utils/create-html';

export class Winners implements View {
  private html: HTMLElement;
  private lastWinnerElement: undefined | HTMLLabelElement = undefined;
  private mediator = Mediator.getInstance();

  constructor() {
    this.html = this.createView();
    this.hidePage();
    this.mediator.subscribe(AppEventsNames.PAGE_WINNERS_OPEN, this.showPage.bind(this));
    this.mediator.subscribe(AppEventsNames.PAGE_HIDE_ALL, this.hidePage.bind(this));
    this.mediator.subscribe(AppEventsNames.CAR_WINNER, this.carWinnerEventHandler.bind(this));
  }

  getHtml() {
    return this.html;
  }

  private createView(): HTMLElement {
    const element = createElement({ tag: 'section', css: ['column'] });

    const nameElement = createElement({ tag: 'label', text: 'WINNERS' });
    this.lastWinnerElement = createElement({
      tag: 'label',
      text: 'none',
    });
    element.append(nameElement, this.lastWinnerElement);

    return element;
  }
  private showPage() {
    this.mediator.notify(AppEventsNames.PAGE_HIDE_ALL);
    this.html.style.display = 'flex';
  }
  private hidePage() {
    this.html.style.display = 'none';
  }
  private carWinnerEventHandler(indexCar: unknown) {
    if (!this.lastWinnerElement) {
      return;
    }
    if (indexCar && typeof indexCar === 'number') {
      this.lastWinnerElement.textContent = indexCar.toString();
    }
  }
}
