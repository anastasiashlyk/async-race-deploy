import type { View } from '../interface/view';
import { createElement } from '../../utils/create-html';
import { Mediator, AppEventsNames } from '../../core/mediator';

export class Controls implements View {
  private html: HTMLElement;
  private buttonGarage: undefined | HTMLButtonElement = undefined;
  private buttonWinners: undefined | HTMLButtonElement = undefined;

  constructor() {
    this.html = this.createView();

    if (!this.buttonGarage || !this.buttonWinners) {
      throw new Error('Error create app html');
    }

    this.buttonGarage.addEventListener('click', this.clickGarageButtonHandler.bind(this));
    this.buttonWinners.addEventListener('click', this.clickWinnersButtonHandler.bind(this));
  }

  getHtml(): HTMLElement {
    return this.html;
  }

  private createView(): HTMLElement {
    const element = createElement({ tag: 'header' });

    this.buttonGarage = createElement({ tag: 'button', text: 'Garage' });
    this.buttonWinners = createElement({ tag: 'button', text: 'Winners' });
    element.append(this.buttonGarage, this.buttonWinners);

    return element;
  }
  private clickGarageButtonHandler() {
    const mediator = Mediator.getInstance();
    mediator.notify(AppEventsNames.PAGE_GARAGE_OPEN);
  }
  private clickWinnersButtonHandler() {
    const mediator = Mediator.getInstance();
    mediator.notify(AppEventsNames.PAGE_WINNERS_OPEN);
  }
}
