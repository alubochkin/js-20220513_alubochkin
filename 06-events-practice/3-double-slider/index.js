export default class DoubleSlider {
  element = null;
  position = {};

  constructor({
    min = 100,
    max = 200,
    formatValue = (value) => '$' + value,
    selected: { from = 120, to = 194 } = {},
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.from = from;
    this.to = to;

    this.render();
    this.listenersInit();
  }

  get tempateCreate() {
    const template = ` 
      <span data-range-num="left">$30</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress" style="left: 0%; right: 0%"></span>
          <span class="range-slider__thumb-left" style="left: 0%"></span>
          <span class="range-slider__thumb-right" style="right: 0%"></span>
        </div>
      <span data-range-num="right">$70</span>`;
    return template;
  }

  rangeNums(num, max, name) {
    const range = Math.ceil((this.min * num) / max);
    if (name === 'LEFT') {
      this.rangeNumLeft.innerText = this.formatValue(range);
    }
    if (name === 'RIGHT') {
      this.rangeNumRight.innerText = this.formatValue(this.max - range);
    }
  }

  move = (event) => {
    const { clientX } = event;
    const { posX, sliderLeft, sliderRight } = this.position;

    let left = clientX - posX - sliderLeft;
    let right = sliderRight - clientX;
    let stop = sliderRight - sliderLeft;

    if (left <= 0) left = 0;
    if (right <= 0) right = 0;

    if (this.eventThumb === this.thumbLeft) {
      if (left + this.to <= stop) {
        this.from = left;
        this.progress.style.left = left + 'px';
        this.eventThumb.style.left = left + 'px';
        this.rangeNums(left, stop, 'LEFT');
      } else return;
    } else {
      if (this.from + right <= stop) {
        this.to = right;
        this.eventThumb.style.right = right + 'px';
        this.progress.style.right = right + 'px';
        this.rangeNums(right, stop, 'RIGHT');
      } else return;
    }
  };

  mousePress = (event) => {
    this.getInitialPosition(event);
    document.addEventListener('pointermove', this.move);
    this.eventThumb = event.target;
  };

  mouseUp = () => {
    document.removeEventListener('pointermove', this.move);
  };

  listenersInit() {
    [this.thumbLeft, this.thumbRight].forEach((thumb) =>
      thumb.addEventListener('pointerdown', this.mousePress)
    );
    document.addEventListener('pointerup', this.mouseUp);
  }

  getInitialPosition(event) {
    this.position.posX =
      event.clientX - event.target.getBoundingClientRect().left;

    this.position.sliderLeft = this.sliderInner.getBoundingClientRect().left;

    this.position.sliderRight = this.sliderInner.getBoundingClientRect().right;
  }

  procentCalc(num) {
    console.log(this.sliderInner);
    return Math.ceil(((num - this.min) * 100) / (this.max - this.min));
  }

  initRange() {
    const left = this.procentCalc(this.from);
    const right = 100 - this.procentCalc(this.to);
    this.thumbLeft.style.left = `${left}%`;
    this.thumbRight.style.right = `${right}%`;
    this.progress.style.cssText = `left: ${left}%; right: ${right}%`;
    this.rangeNumLeft.innerText = this.formatValue(this.from);
    this.rangeNumRight.innerText = this.formatValue(this.to);
  }

  render() {
    this.element = document.createElement('div');
    this.element.classList.add('range-slider');
    this.element.innerHTML = this.tempateCreate;

    this.sliderInner = this.element.querySelector('.range-slider__inner');

    this.thumbLeft = this.element.querySelector('.range-slider__thumb-left');
    this.thumbRight = this.element.querySelector('.range-slider__thumb-right');

    this.rangeNumLeft = this.element.querySelector('[data-range-num="left"]');
    this.rangeNumRight = this.element.querySelector('[data-range-num="right"]');
    this.progress = this.element.querySelector('.range-slider__progress');

    document.body.insertAdjacentElement('afterbegin', this.element);

    this.initRange();
  }

  destroy() {
    if (this.element) this.element.remove();
  }
}
