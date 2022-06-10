import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
import BACKEND_URL_MOCK from './__mocks__/orders-data.js';

console.log(BACKEND_URL_MOCK);

export default class ColumnChart {
  chartHeight = 50;
  LOADING = 'column-chart_loading';
  subElements = {};

  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    url = '',
    range = { from: '', to: '' },

    formatHeading = (data) => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.url = url;
    this.from = range.from;
    this.to = range.to;
    this.formatHeading = formatHeading;

    if (this.formatHeading) {
      this.value = this.formatHeading(this.value);
    }

    this.render();
  }

  async getDataServer() {
    const params = `?from=${this.from.toISOString()}&to=${this.to.toISOString()}`;
    const url = `${BACKEND_URL}/${this.url}${params}`;
    const result = await fetchJson(url);

    return result;
  }

  async render() {
    const root = document.createElement('div');
    root.classList.add('column-chart', this.LOADING);
    root.style['--value'] = this.value;
    this.element = root;
    this.element.innerHTML = this.template;
    this.subElements.body = this.element.querySelector('[data-element="body"]');

    const data = await this.getDataServer();
    if (data) this.rangeData(data);
  }

  rangeData(data) {
    this.subElements.body.innerHTML = this.renderChart(data);
    this.element.classList.remove(this.LOADING);
  }
  renderChart(data) {
    const maxValue = Math.max(...Object.values(data));
    return Object.keys(data)
      .map((item) => {
        const scale = this.chartHeight / maxValue;
        const value = Math.floor(data[item] * scale);
        const percent = ((data[item] / maxValue) * 100).toFixed(0) + '%';

        return `
          <div style="--value: ${value};" data-tooltip="${percent}"></div>
          `;
      })
      .join('');
  }

  async update(from, to) {
    this.from = from;
    this.to = to;
    const data = await this.getDataServer();
    if (data) this.rangeData(data);

    return data;
  }

  get template() {
    return `
      <div class="column-chart__title">Total ${this.label}
        <a href="/${this.link}" class="column-chart__link">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          ${this.value}
        </div>
        <div data-element="body" class="column-chart__chart">

        </div>
      </div>
      `;
  }

  remove() {
    const $el = this.element.parentElement;
    if ($el) {
      $el.remove();
    }
  }

  destroy() {
    this.element.remove();
    this.subElements.body = null;
  }
}
