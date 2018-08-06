const $ = require('jquery');

const BootstrapSwipeCarousel = module.exports = (($) => {
  const NAME = 'swipeCarousel';
  const CAROUSEL_DATA_KEY = 'bs.carousel.swipe2';
  const MIN_SPEED_TO_SLIDE = 200; // pixel per second
  const DEBOUNCE_TIMEOUT = 40; // Magic number (it works and avoids extra slides per taps)

  const shouldSlide = (deltaX, speed, threshold) => (
    Math.abs(deltaX) >= threshold ||
    speed > MIN_SPEED_TO_SLIDE
  );

  class SwipeCarousel {
    constructor(carouselEl, { sensitivity = 'medium', enabled = true } = {}) {
      this.carouselEl = carouselEl;
      this.sensitivity = sensitivity;
      this.enabled = enabled;

      this.threshold = this.sensitivityToThresholdToSlide[sensitivity];

      // We share these properties assuming we swipe on carousel at a given time
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleTouchDown = this.handleTouchDown.bind(this);
      this.handleCarouselSlideStart = this.handleCarouselSlideStart.bind(this);
      this.handleCarouselSlideEnd = this.handleCarouselSlideEnd.bind(this);

      this.state = {
        queue:[]
      };

      if (this.enabled) {
        this.enable();
      }
    }

    get sensitivityToThresholdToSlide() {
      return {
        low: 16,
        medium: 8,
        high: 4
      };
    }

    handleTouchMove(e) {
      const event = e.originalEvent;
      const targetCarousel = $(e.currentTarget);

      if (event.pointerType === 'touch') {
        const deltaX = event.clientX - this.startX;
        const timeElapsedMilliSeconds = Math.max(Date.now() - this.startTime, 1);
        const speedPixelPerSecond = (Math.abs(deltaX) / timeElapsedMilliSeconds) * 1000;

        if (shouldSlide(deltaX, speedPixelPerSecond, this.threshold)) {
          const { state } = this;
          const carouselAction = deltaX > 0 ? 'prev' : 'next';

          if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
          }

          this.debounceTimer = setTimeout(() => {
            // Reset pointer move event waiting for next touch event
            targetCarousel.off('pointermove', this.handleTouchMove);

            // Update state with new action
            this.setState({
              queue: [...state.queue, {
                action: carouselAction
              }]
            });

            this.processCarouselSlideQueue(targetCarousel);
          }, DEBOUNCE_TIMEOUT);
        }
      }
    }

    handleTouchDown(e) {
      const event = e.originalEvent;
      const targetCarousel = $(e.currentTarget);

      if (event.pointerType === 'touch') {
        this.startX = event.clientX;
        this.startTime = Date.now();

        targetCarousel
          .off('pointermove', this.handleTouchMove)
          .on('pointermove', this.handleTouchMove);
      }
    }

    handleCarouselSlideStart(e) {
      const targetCarousel = $(e.target);
      const { state } = this;

      // Remove processed first item from the queue
      this.setState({
        sliding: true,
        queue: state.queue.length ? state.queue.slice(1) : []
      });
    }

    handleCarouselSlideEnd(e) {
      const targetCarousel = $(e.target);
      const { state } = this;

      this.setState({
        sliding: false
      });

      // Check the queue in case more slides needs to happen
      this.processCarouselSlideQueue(targetCarousel);
    }

    processCarouselSlideQueue(targetCarouselEl) {
      const { queue = [] } = this.state;

      if (queue.length > 0) {
        const [ itemToProcess ] = queue;
        targetCarouselEl.carousel(itemToProcess.action);
      }
    }

    setState(newPartialState = { queue: [] } ) {
      this.state = {
        ...this.state,
        ...newPartialState
      }
    }

    enable() {
      this.carouselEl.on({
        'pointerdown': this.handleTouchDown,
        'slide.bs.carousel': this.handleCarouselSlideStart,
        'slid.bs.carousel': this.handleCarouselSlideEnd
      });
    }

    disable() {
      this.carouselEl.off({
        'pointerdown': this.handleTouchDown,
        'slide.bs.carousel': this.handleCarouselSlideStart,
        'slid.bs.carousel': this.handleCarouselSlideEnd
      });
    }

    static get CAROUSEL_DATA_KEY() {
      return CAROUSEL_DATA_KEY;
    }

    static get DEBOUNCE_WAIT() {
      return DEBOUNCE_TIMEOUT;
    }
  }

  SwipeCarousel.jQueryModule = function(config) {
    return this.each(function() {
      const swipeCarousel = $(this).data(CAROUSEL_DATA_KEY);

      if (typeof config === 'string' && swipeCarousel) {
        const action = config;
        if (typeof swipeCarousel[action] === 'function') {
          swipeCarousel[action]();
        }
      } else if (!swipeCarousel) {
        $(this).data(CAROUSEL_DATA_KEY, new SwipeCarousel($(this), config));
      }
    });
 };

  $.fn[NAME] = SwipeCarousel.jQueryModule;
  $.fn[NAME].Constructor = SwipeCarousel;

  return SwipeCarousel;
})($);
