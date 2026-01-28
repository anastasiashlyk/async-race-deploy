import type { View } from '../../interface/view';
import { createElement } from '../../../utils/create-html';
import { CAR_SVG } from '../../../assets/car-svg';
import { deleteCar } from '../../../utils/api-requests/crud';
import type { CarInfo } from '../../../utils/api-requests/car-interface';
import { EngineStatus } from '../../../utils/api-requests/car-interface';
import { Modal } from '../modal/modal';
import { startEngine, drive } from '../../../utils/api-requests/engine';
import flagIcon from '../../../assets/racing-flag.png';

const CAR_WIDTH = 80;
const FLAG_OFFSET = 0;

export class Car implements View {
  private html: HTMLElement;
  private car: HTMLElement;
  private track: HTMLElement;
  private nameLabel: HTMLSpanElement;
  private color: string;
  private id: number;
  private modal: Modal;
  private buttonA: HTMLButtonElement;
  private buttonB: HTMLButtonElement;
  private animationId: number = 0;
  private isDriving: boolean = false;

  constructor(name: string, color: string, id: number, modal: Modal) {
    this.car = createElement({ tag: 'div', css: ['car'] });
    this.track = createElement({ tag: 'div', css: ['track'] });
    this.buttonA = createElement({ tag: 'button', text: 'A', css: ['btn', 'btn-control'] });
    this.buttonB = createElement({ tag: 'button', text: 'B', css: ['btn', 'btn-control'] });
    this.nameLabel = createElement({ tag: 'span' });
    this.id = id;
    this.modal = modal;
    this.html = this.createView();
    this.nameLabel.textContent = name;
    this.color = color;
    this.setColor(color);
    this.buttonB.disabled = true;
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

    const flag = createElement({ tag: 'img', css: ['finish-flag'] });
    flag.src = flagIcon;
    flag.alt = 'Finish line';

    this.buttonA.addEventListener('click', this.startEngineHandler.bind(this));
    this.buttonB.addEventListener('click', this.stopEngineHandler.bind(this));

    this.track.append(this.buttonA, this.buttonB, this.car, flag);
    element.append(modifyButton, deleteButton, this.nameLabel, this.track);
    return element;
  }

  private async startEngineHandler(): Promise<{ name: string; time: number }> {
    this.buttonA.disabled = true;
    this.buttonB.disabled = false;
    this.isDriving = true;

    const { velocity, distance } = await startEngine(this.id, EngineStatus.started);
    const duration = distance / velocity;
    const trackDistance = this.calculateTrackDistance();

    this.animateCar(duration, trackDistance);

    const result = await drive(this.id);
    if (!result.success) {
      this.stopAnimation();
      throw new Error('Car broke down');
    }

    return { name: this.getName(), time: duration };
  }

  public start(): Promise<{ name: string; time: number }> {
    return this.startEngineHandler();
  }

  private async stopEngineHandler(): Promise<void> {
    this.buttonB.disabled = true;

    await startEngine(this.id, EngineStatus.stopped).catch(() => {});

    this.stopAnimation();
    this.resetCarPosition();
    this.buttonA.disabled = false;
  }

  private calculateTrackDistance(): number {
    const trackWidth = this.track.offsetWidth;
    const buttonsWidth = this.buttonA.offsetWidth + this.buttonB.offsetWidth + 20;
    return trackWidth - buttonsWidth - CAR_WIDTH - FLAG_OFFSET;
  }

  private animateCar(duration: number, trackDistance: number): void {
    const startTime = performance.now();

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentPosition = progress * trackDistance;
      this.car.style.transform = `translateX(${currentPosition}px)`;

      if (progress < 1 && this.isDriving) {
        this.animationId = requestAnimationFrame(animate);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
    this.isDriving = false;
  }

  private resetCarPosition(): void {
    this.car.style.transform = 'translateX(0)';
  }

  public reset(): void {
    this.stopAnimation();
    this.resetCarPosition();
    this.buttonA.disabled = false;
    this.buttonB.disabled = true;
    startEngine(this.id, EngineStatus.stopped).catch(() => {});
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
