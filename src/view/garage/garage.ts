import { Mediator, AppEventsNames } from '../../core/mediator';
import type { View } from '../interface/view';
import { createElement } from '../../utils/create-html';
import { Car } from './car/car';
import { getGarage } from '../../utils/api-requests/crud';
import { Form } from './form/form';
import { createCar } from '../../utils/api-requests/crud';
import { Modal } from './modal/modal';
import type { GarageResponse } from '../../utils/api-requests/car-interface';
import { generateRandomCars } from '../../utils/random-car-generator';
import { saveWinner } from '../../utils/api-requests/winners';

const CARS_PER_PAGE = 7;

export class Garage implements View {
  private html: HTMLElement;
  private startRaceButton: undefined | HTMLButtonElement = undefined;
  private resetRaceButton: undefined | HTMLButtonElement = undefined;
  private generateCarsButton: undefined | HTMLButtonElement = undefined;
  private carsContainer: undefined | HTMLDivElement = undefined;
  private createWarning: undefined | HTMLElement = undefined;
  private winnerAnnouncement: undefined | HTMLElement = undefined;
  private modal: Modal;
  private mediator = Mediator.getInstance();
  private cars: Car[] = [];

  private currentPage = 1;
  private totalCars = 0;
  private pageIndicator: HTMLSpanElement | undefined = undefined;
  private prevButton: HTMLButtonElement | undefined = undefined;
  private nextButton: HTMLButtonElement | undefined = undefined;

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

    const nameElement = createElement({ tag: 'h1', text: 'GARAGE' });
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
      css: ['btn', 'primary-button'],
    });
    this.resetRaceButton = createElement({
      tag: 'button',
      text: 'Reset Race',
      css: ['btn', 'primary-button'],
    });
    this.resetRaceButton.addEventListener('click', this.resetRaceHandler.bind(this));
    this.generateCarsButton = createElement({
      tag: 'button',
      text: 'Generate Cars',
      css: ['btn', 'primary-button'],
    });
    this.generateCarsButton.addEventListener('click', this.generateCarsHandler.bind(this));

    const raceControls = createElement({ tag: 'div', css: ['race-controls'] });
    raceControls.append(this.startRaceButton, this.resetRaceButton, this.generateCarsButton);

    const pagination = this.createPagination();

    element.append(
      nameElement,
      createForm.getHtml(),
      raceControls,
      this.carsContainer,
      pagination,
      this.modal.getHtml()
    );

    return element;
  }

  private createPagination(): HTMLElement {
    const pagination = createElement({ tag: 'div', css: ['pagination'] });

    this.prevButton = createElement({
      tag: 'button',
      text: '← Prev',
      css: ['btn'],
    }) as HTMLButtonElement;
    this.prevButton.addEventListener('click', () => this.changePage(-1));

    this.pageIndicator = createElement({ tag: 'span', css: ['page-indicator'] });

    this.nextButton = createElement({
      tag: 'button',
      text: 'Next →',
      css: ['btn'],
    }) as HTMLButtonElement;
    this.nextButton.addEventListener('click', () => this.changePage(1));

    pagination.append(this.prevButton, this.pageIndicator, this.nextButton);
    return pagination;
  }

  private async loadCars() {
    if (!this.carsContainer) return;

    this.carsContainer.innerHTML = '';
    this.cars = [];
    const garage: GarageResponse = await getGarage(this.currentPage, CARS_PER_PAGE);
    this.totalCars = garage.totalCount ?? 0;

    for (const carData of garage.cars) {
      const car = new Car(carData.name, carData.color, carData.id, this.modal);
      this.cars.push(car);
      this.carsContainer.append(car.getHtml());
    }

    this.updatePaginationState();
  }

  private resetRaceHandler(): void {
    for (const car of this.cars) {
      car.reset();
    }
    if (this.startRaceButton) {
      this.startRaceButton.disabled = false;
    }
  }

  private updatePaginationState(): void {
    const totalPages = Math.ceil(this.totalCars / CARS_PER_PAGE);

    if (this.pageIndicator) {
      this.pageIndicator.textContent = `Page ${this.currentPage} of ${totalPages || 1} (${this.totalCars} cars)`;
    }

    if (this.prevButton) {
      this.prevButton.disabled = this.currentPage <= 1;
    }

    if (this.nextButton) {
      this.nextButton.disabled = this.currentPage >= totalPages;
    }
  }

  private async changePage(direction: number): Promise<void> {
    const totalPages = Math.ceil(this.totalCars / CARS_PER_PAGE);
    const newPage = this.currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
      const scrollPosition = window.scrollY;
      this.currentPage = newPage;
      await this.loadCars();
      window.scrollTo(0, scrollPosition);
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
    await createCar(name.value, color.value);
    this.totalCars += 1;
    await this.loadCars();
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

  private async startRaceClickHandler(): Promise<void> {
    if (!this.startRaceButton) {
      return;
    }

    this.startRaceButton.disabled = true;
    this.hideWinnerAnnouncement();

    const racePromises = this.cars.map((car) => car.start().then((result) => result));

    try {
      const winner = await Promise.any(racePromises);
      await saveWinner(winner.id, winner.time / 1000);
      this.showWinnerAnnouncement(winner.name, winner.time);
    } catch {
      // All cars crashed
    }
  }

  private showWinnerAnnouncement(name: string, time: number): void {
    if (!this.winnerAnnouncement) {
      this.winnerAnnouncement = createElement({
        tag: 'div',
        css: ['winner-overlay'],
      });

      const winnerContent = createElement({
        tag: 'div',
        css: ['winner-content'],
      });

      this.winnerAnnouncement.append(winnerContent);
      this.winnerAnnouncement.addEventListener('click', (event) => {
        if (event.target === this.winnerAnnouncement) {
          this.hideWinnerAnnouncement();
        }
      });

      document.body.append(this.winnerAnnouncement);
    }

    const timeInSeconds = (time / 1000).toFixed(2);
    const content = this.winnerAnnouncement.querySelector('.winner-content');
    if (content) {
      content.textContent = `🏆 Winner: ${name} (${timeInSeconds}s)`;
    }
    this.winnerAnnouncement.style.display = 'flex';
  }

  private hideWinnerAnnouncement(): void {
    if (this.winnerAnnouncement) {
      this.winnerAnnouncement.style.display = 'none';
    }
  }

  private async generateCarsHandler(): Promise<void> {
    if (this.generateCarsButton) {
      this.generateCarsButton.disabled = true;
    }

    const randomCars = generateRandomCars(100);

    const createPromises = randomCars.map((carData) => createCar(carData.name, carData.color));
    await Promise.all(createPromises);

    this.totalCars += 100;
    await this.loadCars();

    if (this.generateCarsButton) {
      this.generateCarsButton.disabled = false;
    }
  }
}
