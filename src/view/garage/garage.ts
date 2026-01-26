import { Mediator, AppEventsNames } from '../../core/mediator';
import type { View } from '../interface/view';
import { createElement } from '../../utils/create-html';
import { Car } from './car/car';
import { getGarage, type GarageResponse } from '../../utils/api-requests';
import { Form } from './form/form';
import { createCar, type CarInfo } from '../../utils/api-requests';
import { Modal } from './modal/modal';

export class Garage implements View {
  private html: HTMLElement;
  private startRaceButton: undefined | HTMLButtonElement = undefined;
  private carsContainer: undefined | HTMLDivElement = undefined;
  private createWarning: undefined | HTMLElement = undefined;
  private modal: Modal;
  private mediator = Mediator.getInstance();

  constructor() {
    this.modal = new Modal();
    this.html = this.createView();
    if (!this.startRaceButton) {
      throw new Error('Error create app html');
    }

    this.hidePage();
    this.mediator.subscribe(AppEventsNames.PAGE_GARAGE_OPEN, this.showPage.bind(this));
    this.mediator.subscribe(AppEventsNames.PAGE_HIDE_ALL, this.hidePage.bind(this));
    this.startRaceButton.addEventListener('click', this.startRaceClickHandler.bind(this));
  }

  getHtml() {
    return this.html;
  }

  private createView(): HTMLElement {
    const element = createElement({ tag: 'section', css: ['column', 'garage'] });

    const nameElement = createElement({ tag: 'label', text: 'GARAGE' });
    const createForm = new Form('Create');
    const createButton = createForm.getBtn();
    createButton.addEventListener('click', this.createClickHandler.bind(this));
    this.createWarning = createElement({
      tag: 'span',
      text: 'The name can not be empty',
      css: ['warning'],
    });
    this.createWarning.style.display = 'none';
    createForm.getHtml().append(this.createWarning);
    this.carsContainer = createElement({ tag: 'div', css: ['cars'] });
    this.loadCars();
    this.startRaceButton = createElement({
      tag: 'button',
      text: 'StartRace',
      css: ['primary-button'],
    });

    element.append(
      nameElement,
      createForm.getHtml(),
      this.startRaceButton,
      this.carsContainer,
      this.modal.getHtml()
    );

    return element;
  }

  private async loadCars() {
    const garage: GarageResponse = await getGarage();
    console.log(garage);
    for (const car of garage.cars) {
      this.carsContainer?.append(new Car(car.name, car.color, car.id, this.modal).getHtml());
    }
  }

  private showPage() {
    this.mediator.notify(AppEventsNames.PAGE_HIDE_ALL);
    this.html.style.display = 'flex';
  }

  private hidePage() {
    this.html.style.display = 'none';
  }

  private async createClickHandler(event: Event) {
    event.preventDefault();
    const name = document.querySelector('#Create-name') as HTMLInputElement;
    const color = document.querySelector('#Create-color') as HTMLInputElement;

    if (name.value.trim() === '') {
      this.showWarning();
      return;
    }

    this.hideWarning();
    const car: CarInfo = await createCar(name.value, color.value);
    this.carsContainer?.append(new Car(car.name, car.color, car.id, this.modal).getHtml());
    name.value = '';
  }

  private showWarning() {
    if (this.createWarning) {
      this.createWarning.style.display = 'block';
    }
  }

  private hideWarning() {
    if (this.createWarning) {
      this.createWarning.style.display = 'none';
    }
  }

  private startRaceClickHandler() {
    if (!this.startRaceButton) {
      return;
    }

    // setTimeout только для имитации
    this.startRaceButton.disabled = true;
    setTimeout(() => {
      const indexCar = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
      this.mediator.notify(AppEventsNames.CAR_WINNER, indexCar);
      if (this.startRaceButton) {
        this.startRaceButton.disabled = false;
      }
    }, 2000);
  }
}
