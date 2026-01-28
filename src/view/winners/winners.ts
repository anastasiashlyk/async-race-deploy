import { Mediator, AppEventsNames } from '../../core/mediator';
import type { View } from '../interface/view';
import { createElement } from '../../utils/create-html';
import { getWinners, type SortField, type SortOrder } from '../../utils/api-requests/winners';
import type { WinnerInfo } from '../../utils/api-requests/car-interface';
import { getCarById } from '../../utils/api-requests/crud';
import { CAR_SVG } from '../../assets/car-svg';

const WINNERS_PER_PAGE = 10;

interface WinnerRow {
  id: number;
  name: string;
  color: string;
  wins: number;
  time: number;
}

export class Winners implements View {
  private html: HTMLElement;
  private tableBody: HTMLTableSectionElement | undefined;
  private pageIndicator: HTMLSpanElement | undefined;
  private prevButton: HTMLButtonElement | undefined;
  private nextButton: HTMLButtonElement | undefined;
  private mediator = Mediator.getInstance();

  private currentPage = 1;
  private totalWinners = 0;
  private sortField: SortField = 'wins';
  private sortOrder: SortOrder = 'DESC';

  constructor() {
    this.html = this.createView();
    this.hidePage();
    this.mediator.subscribe(AppEventsNames.PAGE_WINNERS_OPEN, this.showPage.bind(this));
    this.mediator.subscribe(AppEventsNames.PAGE_HIDE_ALL, this.hidePage.bind(this));
  }

  getHtml() {
    return this.html;
  }

  private createView(): HTMLElement {
    const element = createElement({ tag: 'section', css: ['column', 'winners'] });

    const title = createElement({ tag: 'h1', text: 'WINNERS' });

    const table = createElement({ tag: 'table', css: ['winners-table'] });
    const thead = createElement({ tag: 'thead' });
    const headerRow = createElement({ tag: 'tr' });

    const headers = [
      { text: 'ID', sortable: false, field: undefined },
      { text: 'Car', sortable: false, field: undefined },
      { text: 'Name', sortable: false, field: undefined },
      { text: 'Wins', sortable: true, field: 'wins' as SortField },
      { text: 'Best Time (s)', sortable: true, field: 'time' as SortField },
    ];

    for (const header of headers) {
      const th = createElement({ tag: 'th', text: header.text });
      if (header.sortable && header.field) {
        th.classList.add('sortable');
        th.dataset['field'] = header.field;
        th.addEventListener('click', () => this.handleSort(header.field!));
      }
      headerRow.append(th);
    }

    thead.append(headerRow);
    this.tableBody = createElement({ tag: 'tbody' });
    table.append(thead, this.tableBody);

    const pagination = this.createPagination();

    element.append(title, table, pagination);

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

  private async loadWinners(): Promise<void> {
    if (!this.tableBody) return;

    const { winners, totalCount } = await getWinners(
      this.currentPage,
      WINNERS_PER_PAGE,
      this.sortField,
      this.sortOrder
    );

    this.totalWinners = totalCount ?? 0;

    const winnerRows: WinnerRow[] = await Promise.all(
      winners.map(async (winner: WinnerInfo) => {
        const car = await getCarById(winner.id);
        return {
          id: winner.id,
          name: car?.name ?? 'Unknown',
          color: car?.color ?? '#000000',
          wins: winner.wins,
          time: winner.time,
        };
      })
    );

    this.tableBody.innerHTML = '';

    for (const winner of winnerRows) {
      const row = createElement({ tag: 'tr' });

      const numberCell = createElement({ tag: 'td', text: winner.id.toString() });

      const carCell = createElement({ tag: 'td', css: ['car-cell'] });
      const carIcon = createElement({ tag: 'span', css: ['car-icon'] });
      carIcon.innerHTML = CAR_SVG;
      carIcon.style.color = winner.color;
      carCell.append(carIcon);

      const nameCell = createElement({ tag: 'td', text: winner.name });
      const winsCell = createElement({ tag: 'td', text: winner.wins.toString() });
      const timeCell = createElement({ tag: 'td', text: winner.time.toFixed(2) });

      row.append(numberCell, carCell, nameCell, winsCell, timeCell);
      this.tableBody.append(row);
    }

    this.updatePaginationState();
    this.updateSortIndicators();
  }

  private updatePaginationState(): void {
    const totalPages = Math.ceil(this.totalWinners / WINNERS_PER_PAGE);

    if (this.pageIndicator) {
      this.pageIndicator.textContent = `Page ${this.currentPage} of ${totalPages || 1} (${this.totalWinners} winners)`;
    }

    if (this.prevButton) {
      this.prevButton.disabled = this.currentPage <= 1;
    }

    if (this.nextButton) {
      this.nextButton.disabled = this.currentPage >= totalPages;
    }
  }

  private updateSortIndicators(): void {
    const headers = this.html.querySelectorAll('th.sortable');
    for (const header of headers) {
      header.classList.remove('sort-asc', 'sort-desc');
      if ((header as HTMLElement).dataset['field'] === this.sortField) {
        header.classList.add(this.sortOrder === 'ASC' ? 'sort-asc' : 'sort-desc');
      }
    }
  }

  private async handleSort(field: SortField): Promise<void> {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortField = field;
      this.sortOrder = 'DESC';
    }
    this.currentPage = 1;
    await this.loadWinners();
  }

  private async changePage(direction: number): Promise<void> {
    const totalPages = Math.ceil(this.totalWinners / WINNERS_PER_PAGE);
    const newPage = this.currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
      this.currentPage = newPage;
      await this.loadWinners();
    }
  }

  private showPage(): void {
    this.mediator.notify(AppEventsNames.PAGE_HIDE_ALL);
    this.html.style.display = 'flex';
    this.loadWinners();
  }

  private hidePage(): void {
    this.html.style.display = 'none';
  }
}
