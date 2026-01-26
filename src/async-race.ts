import './style.css';
import { Mediator, AppEventsNames } from './core/mediator';
import { Garage } from './view/garage/garage.ts';
import { Winners } from './view/winners/winners.ts';
import { Controls } from './view/controls/controls.ts';

export class AsyncRace {
  constructor() {
    this.createView();

    const mediator = Mediator.getInstance();
    mediator.notify(AppEventsNames.PAGE_GARAGE_OPEN);
  }
  private createView() {
    const controls = new Controls();
    const garage = new Garage();
    const winners = new Winners();
    console.log(controls.getHtml());
    document.body.append(controls.getHtml(), garage.getHtml(), winners.getHtml());
  }
}
