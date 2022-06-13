export default class SortableTable {
  element = null;
  subElements = {
    header: null,
    body: null,
    arrow: null,
  };

  constructor(headersConfig, { data = [], sorted = {} } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.createdRootElement();
    this.arrowTemplateCreated();
    this.headerTemlateCreate();
    this.render();
    this.sort(this.sorted.id, this.sorted.id);
    this.listener();
  }

  sort(fieldValue, orderValue) {
    const sortableFn = (a, b) => {
      const collator = new Intl.Collator('ru-en', {
        sensitivity: 'case',
        caseFirst: 'upper',
        numeric: true,
      });
      const sortA = a[fieldValue];
      const sortB = b[fieldValue];
      if (orderValue === 'desc') {
        return collator.compare(sortB, sortA);
      }
      return collator.compare(sortA, sortB);
    };
    this.data.sort(sortableFn);
    this.render();
  }

  createdRootElement() {
    this.element = this.elemetCreate('div', ['sortable-table']);
  }

  headerTemlateCreate() {
    const headerTemplate = this.headersConfig
      .map((data) => {
        const { id, title, sortable, sortType } = data;
        return `
          <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${sortType}">
            <span>${title}</span>
          </div>`;
      })
      .join('');

    this.subElements.header = this.elemetCreate(
      'div',
      ['sortable-table__header', 'sortable-table__row'],
      [['data-element', 'header']]
    );
    this.subElements.header.innerHTML = headerTemplate;
  }

  bodyTemlateCreate() {
    const bodyTemplate = this.data
      .map(({ images = [], title, quantity, price, sales, id }, i) => {
        const cellsSortable = [title, quantity, price, sales]
          .map((el) => {
            if (el) {
              return `<div class="sortable-table__cell">${el}</div>`;
            }
          })
          .join('');

        const image = images.length
          ? `<div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${images[0].url}">
          </div>`
          : '';

        return `
        <a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">
          ${image}
          ${cellsSortable}
        </a>
    `;
      })
      .join('');

    this.subElements.body = this.elemetCreate('div', ['sortable-table__body']);
    this.subElements.body.innerHTML = bodyTemplate;
  }

  elemetCreate(tag = 'div', classNames = [''], dataAttr = []) {
    tag = document.createElement(tag);
    classNames.forEach((className) => tag.classList.add(className));
    dataAttr.forEach((atr) => tag.setAttribute(atr[0], atr[1]));
    return tag;
  }

  arrowTemplateCreated() {
    this.subElements.arrow = this.elemetCreate(
      'span',
      ['sortable-table__sort-arrow'],
      [['data-element', 'arrow']]
    );
    this.subElements.arrow.innerHTML = `<span class="sort-arrow"></span>`;
  }

  listener() {
    this.element.addEventListener('pointerdown', this.clickHeaderSorter);
  }

  clickHeaderSorter = (event) => {
    let target = event.target.parentElement;
    if (target.dataset.sortable !== 'true') {
      return;
    }

    if (this.sorted.id === target.dataset.id) {
      this.setArrow();
      if (this.sorted.order === 'asc') {
        this.sorted.order = 'desc';
      } else {
        this.sorted.order = 'asc';
      }
    } else this.sorted.id = target.dataset.id;

    this.sorted.id = target.dataset.id;
    this.sort(this.sorted.id, this.sorted.order);
  };

  clear() {
    if (this.subElements.body) this.subElements.body.remove();
  }

  setArrow() {
    const arrowTargetElement = [...this.subElements.header.children].find(
      (elem) => elem.dataset.id === this.sorted.id
    );
    arrowTargetElement.append(this.subElements.arrow);
    this.subElements.arrow.children[0].dataset.id = this.sorted.id;
  }

  render() {
    this.clear();
    this.bodyTemlateCreate();
    this.setArrow();
    this.element.insertAdjacentElement('afterbegin', this.subElements.body);
    this.element.insertAdjacentElement('afterbegin', this.subElements.header);
  }

  destroy() {
    this.element.remove();
    this.element.removeEventListener('pointerdown', this.clickHeaderSorter);
  }
}
