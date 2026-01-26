import type { View } from '../../interface/view';
import { createElement } from '../../../utils/create-html';
import { CAR_SVG } from '../../../assets/car-svg';
import { deleteCar, type CarInfo } from '../../../utils/api-requests';
import { Modal } from '../modal/modal';

export class Car implements View {
  private html: HTMLElement;
  private car: HTMLElement;
  private nameLabel: HTMLSpanElement;
  private color: string;
  private id: number;
  private modal: Modal;

  constructor(name: string, color: string, id: number, modal: Modal) {
    this.car = createElement({ tag: 'div', css: ['car'] });
    this.nameLabel = createElement({ tag: 'span' });
    this.id = id;
    this.modal = modal;
    this.html = this.createView();
    this.nameLabel.textContent = name;
    this.color = color;
    this.setColor(color);
  }

  getHtml(): HTMLElement {
    return this.html;
  }

  setName(name: string): void {
    this.nameLabel.textContent = name;
  }

  getName(): string {
    return this.nameLabel.textContent || '';
  }

  setColor(color: string): void {
    this.car.style.color = color;
    this.color = color;
  }

  getColor(): string {
    return this.color;
  }

  getId(): number {
    return this.id;
  }

  private createView(): HTMLElement {
    const element = createElement({ tag: 'div', css: ['road'] });
    element.id = this.id.toString();
    this.car.innerHTML = CAR_SVG;
    const modifyButton = createElement({ tag: 'button', text: 'Modify', css: ['btn'] });
    const deleteButton = createElement({ tag: 'button', text: 'Delete', css: ['btn'] });
    modifyButton.addEventListener('click', this.modifyClickHandler.bind(this));
    deleteButton.addEventListener('click', this.deleteClickHandler.bind(this));
    element.append(modifyButton, deleteButton, this.nameLabel, this.car);
    return element;
  }

  private modifyClickHandler(): void {
    this.modal.show(this.id, this.getName(), this.getColor(), (updatedCar: CarInfo) => {
      this.setName(updatedCar.name);
      this.setColor(updatedCar.color);
    });
  }

  private async deleteClickHandler(): Promise<void> {
    const ok = await deleteCar(this.id);
    if (ok) {
      this.html.remove();
    } else {
      alert('Error deleting car');
    }
  }
}
