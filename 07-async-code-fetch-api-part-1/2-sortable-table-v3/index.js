import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  start = 0;
  end = 20;
  step = 20;
  element = null;
  id = null;
  order = null;
  subElements = {};
  height = 0;
  constructor(
    headersConfig,
    { data = [], sorted = {}, url = 'api/rest/products' } = {}
  ) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = url;

    this.render();
  }

  sortOnClient(id = 'title', order = 'desc') {
    const sortableFn = (a, b) => {
      const collator = new Intl.Collator('ru-en', {
        sensitivity: 'case',
        caseFirst: 'upper',
        numeric: true,
      });
      const sortA = a[id];
      const sortB = b[id];
      if (order === 'desc') {
        return collator.compare(sortB, sortA);
      }
      return collator.compare(sortA, sortB);
    };
    this.data.sort(sortableFn);
    this.update();
  }
  clickHeaderSorter = (event) => {
    let target = event.target.parentElement;
    if (target.dataset.sortable !== 'true') {
      return;
    }

    if (this.sorted.id === target.dataset.id) {
      if (this.sorted.order === 'asc') {
        this.sorted.order = 'desc';
      } else {
        this.sorted.order = 'asc';
      }
    } else this.sorted.id = target.dataset.id;

    this.sorted.id = target.dataset.id;
    if (this.start >= this.step) {
      this.data = [];
      console.log(
        '%cindex.js line:60 this.sorted.order',
        'color: #007acc;',
        this.sorted.order
      );
      this.sortOnServer(this.sorted.id, this.sorted.order, 0, this.end);
    } else {
      this.sortOnClient(this.sorted.id, this.sorted.order);
    }
  };

  scrollUploadData = (event) => {
    const bottom = document.body.getBoundingClientRect().bottom;

    if (bottom <= document.documentElement.clientHeight) {
      console.log('%cindex.js line:69 ', 'color: #a9ebdd;', 'scrollUploadData');
      this.start = this.end;
      this.end += this.step;
      this.sortOnServer(
        this.sorted.id,
        this.sorted.order,
        this.start,
        this.end
      );
    }
  };

  sortOnServer(id, order, start, end) {
    this.getDataServer({ sort: id, order: order, start, end }).then(
      (result) => {
        this.data.push(...result);
        this.update();
      }
    );
  }

  async getDataServer({
    start = 0,
    end = 20,
    embed = '',
    sort = 'titls',
    order = 'asc',
  } = {}) {
    const params = `?_embed=${embed}&_sort=${sort}&_order=${order}&_start=${start}&_end=${end}`;
    return await fetchJson(`${BACKEND_URL}/${this.url}${params}`);
  }

  elemetCreate(tag = 'div', classNames = [''], dataAttr = []) {
    tag = document.createElement(tag);
    classNames.forEach((className) => tag.classList.add(className));
    dataAttr.forEach((atr) => tag.setAttribute(atr[0], atr[1]));
    return tag;
  }

  listener() {
    this.element.addEventListener('pointerdown', this.clickHeaderSorter);
    document.addEventListener('scroll', debounce(this.scrollUploadData, 300));
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
    return this.data
      .map(({ images = [], title, quantity, price, sales, status }, i) => {
        const cellsSortable = [title, quantity, price, sales, status]
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
          </a>`;
      })
      .join('');
  }

  update() {
    this.clear();
    console.log(this.data);
    this.subElements.body.innerHTML += this.bodyTemlateCreate();
  }

  init() {
    this.height = window.pageYOffset;
    this.element = this.elemetCreate('div', ['sortable-table']);
    this.subElements.body = this.elemetCreate('div', ['sortable-table__body']);
    this.headerTemlateCreate();
    this.listener();

    this.getDataServer().then((result) => {
      this.data.push(...result);
      this.update();
    });
  }

  render() {
    this.init();
    this.element.insertAdjacentElement('afterbegin', this.subElements.header);
    this.element.insertAdjacentElement('beforeend', this.subElements.body);
  }

  clear() {
    if (this.subElements.body) this.subElements.body.innerHTML = '';
  }
  destroy() {
    this.element.remove();
    this.element.removeEventListener('pointerdown', this.clickHeaderSorter);
  }
}

function debounce(func, time) {
  return function (args) {
    let prevCall = this.lastCall;
    this.lastCall = Date.now();

    if (prevCall && this.lastCall - prevCall <= time) {
      clearTimeout(this.lastCallTimer);
    }
    this.lastCallTimer = setTimeout(() => func(args), time);
  };
}
