import $ from 'jquery';

const BootstrapSwipeCarousel = (() => {
  const NAME = 'swipeCarousel';
  const CAROUSEL_DATA_KEY = 'bs.carousel.swipe2';
  const MIN_SPEED_TO_SLIDE = 200; // pixel per second
  const DEBOUNCE_TIMEOUT = 40; // Magic number (it works and avoids extra slides per taps)

  const shouldSlide = (deltaX, speed, threshold) => (
    Math.abs(deltaX) >= threshold
    || speed > MIN_SPEED_TO_SLIDE
  );

  const hasPointerEvents = () => ('PointerEvent' in window);

  class SwipeCarousel {
    handleTouchDown = (e) => {
      const event = e.originalEvent;
      const targetCarousel = $(e.currentTarget);

      this.startTime = Date.now();

      if (event.type.indexOf('touch') > -1) {
        this.startX = event.touches[0].pageX;
        targetCarousel
          .off('touchmove', this.handleTouchMove)
          .on('touchmove', this.handleTouchMove);
      } else if (event.pointerType === 'touch') {
        this.startX = event.clientX;

        targetCarousel
          .off('pointermove', this.handleTouchMove)
          .on('pointermove', this.handleTouchMove);
      }
    }

    handleTouchMove = (e) => {
      const event = e.originalEvent;
      const targetCarousel = $(e.currentTarget);
      const timeElapsedMilliSeconds = Math.max(Date.now() - this.startTime, 1);

      let deltaX;

      if (event.type.indexOf('touch') > -1) {
        deltaX = event.touches[0].pageX - this.startX;
      } else if (event.pointerType === 'touch') {
        deltaX = event.clientX - this.startX;
      }

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
          targetCarousel.off('touchmove', this.handleTouchMove);

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

    handleCarouselSlideStart = () => {
      const { state } = this;

      // Remove processed first item from the queue
      this.setState({
        sliding: true,
        queue: state.queue.slice(1)
      });
    }

    handleCarouselSlideEnd = (e) => {
      const targetCarousel = $(e.target);

      this.setState({
        sliding: false
      });

      // Check the queue in case more slides needs to happen
      this.processCarouselSlideQueue(targetCarousel);
    }

    constructor(carouselEl, { sensitivity = 'medium', enabled = true } = {}) {
      this.carouselEl = carouselEl;
      this.sensitivity = sensitivity;
      this.threshold = this.sensitivityToThresholdToSlide[sensitivity];

      this.state = {
        queue: [],
        enabled: false
      };

      this.initialise(enabled);
    }

    initialise(enabled) {
      if (enabled) {
        this.enable();
      }
    }

    toggleEnabledState() {
      const { enabled } = this.state;
      this.setState({
        enabled: !enabled
      });
    }

    get sensitivityToThresholdToSlide() {
      return {
        low: 16,
        medium: 8,
        high: 4
      };
    }

    processCarouselSlideQueue(targetCarouselEl) {
      const { queue } = this.state;

      if (queue.length > 0) {
        const [ itemToProcess ] = queue;
        targetCarouselEl.carousel(itemToProcess.action);
      }
    }

    setState(newPartialState) {
      this.state = {
        ...this.state,
        ...newPartialState
      };
    }

    enable() {
      if (!this.state.enabled) {
        const touchEventName = hasPointerEvents() ? 'pointerdown' : 'touchstart';

        this.carouselEl.on({
          [touchEventName]: this.handleTouchDown,
          'slide.bs.carousel': this.handleCarouselSlideStart,
          'slid.bs.carousel': this.handleCarouselSlideEnd
        });

        this.toggleEnabledState();
      }
    }

    disable() {
      if (this.state.enabled) {
        const touchEventName = hasPointerEvents() ? 'pointerdown' : 'touchstart';

        this.carouselEl.off({
          [touchEventName]: this.handleTouchDown,
          'slide.bs.carousel': this.handleCarouselSlideStart,
          'slid.bs.carousel': this.handleCarouselSlideEnd
        });

        this.toggleEnabledState();
      }
    }

    static get CAROUSEL_DATA_KEY() {
      return CAROUSEL_DATA_KEY;
    }

    static get DEBOUNCE_WAIT() {
      return DEBOUNCE_TIMEOUT;
    }
  }

  SwipeCarousel.jQueryModule = function jQueryInterface(config) {
    return this.each(function addModuleWrapper() {
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
})();

export default BootstrapSwipeCarousel;
