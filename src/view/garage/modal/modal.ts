import { createElement } from '../../../utils/create-html';
import { updateCar } from '../../../utils/api-requests/crud';
import type { CarInfo } from '../../../utils/api-requests/car-interface';
import type { View } from '../../interface/view';
import { Form } from '../form/form';

export class Modal implements View {
  private html: HTMLElement;
  private modal!: HTMLElement;
  private form: Form;
  private nameInput: HTMLInputElement | undefined;
  private colorInput: HTMLInputElement | undefined;
  private currentCarId: number | undefined;
  private originalColor: string = '';
  private onUpdateCallback: ((car: CarInfo) => void) | undefined;

  constructor() {
    this.form = new Form('Update');
    this.html = this.createView();
    this.hide();
  }

  getHtml(): HTMLElement {
    return this.html;
  }

  hide(): void {
    this.html.style.display = 'none';
  }

  show(
    carId: number,
    currentName: string,
    currentColor: string,
    onUpdate: (car: CarInfo) => void
  ): void {
    this.currentCarId = carId;
    this.originalColor = currentColor;
    this.onUpdateCallback = onUpdate;

    if (this.nameInput) {
      this.nameInput.value = currentName;
    }
    if (this.colorInput) {
      this.colorInput.value = currentColor;
    }

    this.html.style.display = 'flex';
  }

  private createView(): HTMLElement {
    const overlay = createElement({ tag: 'div', css: ['modal-overlay'] });
    this.modal = createElement({ tag: 'div', css: ['modal'] });

    const closeButton = createElement({ tag: 'button', text: '×', css: ['modal-close'] });
    closeButton.addEventListener('click', () => this.hide());

    const formHtml = this.form.getHtml();
    this.nameInput = formHtml.querySelector('#Update-name') as HTMLInputElement;
    this.colorInput = formHtml.querySelector('#Update-color') as HTMLInputElement;

    const updateButton = this.form.getBtn();
    updateButton.addEventListener('click', this.handleUpdate.bind(this));

    this.modal.append(closeButton, formHtml);
    overlay.append(this.modal);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        this.hide();
      }
    });

    return overlay;
  }

  private async handleUpdate(event: Event): Promise<void> {
    event.preventDefault();

    if (this.currentCarId === undefined) {
      return;
    }

    const newName = this.nameInput?.value.trim() || '';
    const newColor = this.colorInput?.value || this.originalColor;

    if (newName === '' || newColor === '') {
      return;
    }

    const finalColor = newColor === this.originalColor ? this.originalColor : newColor;

    const updatedCar: CarInfo = await updateCar(this.currentCarId, newName, finalColor);

    if (this.onUpdateCallback) {
      this.onUpdateCallback(updatedCar);
    }

    this.hide();
  }
}
