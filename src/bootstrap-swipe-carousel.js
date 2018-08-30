import $ from 'jquery';

const BootstrapSwipeCarousel = (() => {
  const NAME = 'swipeCarousel';
  const CAROUSEL_DATA_KEY = 'bs.carousel.swipe2';
  const MIN_SPEED_TO_SLIDE = 300; // pixel per second
  const DEBOUNCE_TIMEOUT = 40; // Magic number (it works and avoids extra slides per taps)

  const shouldSlide = (deltaX, speed, threshold) => (
    speed > MIN_SPEED_TO_SLIDE
  );

  class SwipeCarousel {
    handleTouchDown = (e) => {
      const event = e.originalEvent;
      const targetCarousel = $(e.currentTarget);

      if (event.pointerType === 'touch') {
        this.startX = event.clientX;
        this.startTime = Date.now();

        targetCarousel
          .off('touchmove', this.handleTouchMove)
          .on('touchmove', this.handleTouchMove)
          .off('touchend', this.handleTouchUp)
          .one('touchend', this.handleTouchUp);
      }
    };

    handleTouchUp = (e) => {
      console.log('Touchend', e.touches);

      if (!this.debounceTimer && !this.state.sliding) {
        const activeSlideEl = this.activeSlideEl || this.carouselEl.find('.carousel-item.active');
        const width = activeSlideEl.outerWidth();
        const index = activeSlideEl.index();

        const transformX = -1 * index * width;

        this.carouselInnerEl.css({
          transform: `translateX(${transformX}px)`
        });
      }
    }

    updateCarouselStyle = () => {
      this.carouselEl.eq(0).data('bs.carousel')._config.interval = 500000;

      const totalWidth = this.carouselEl.find('.carousel-item')
        .map((index, el) => $(el).outerWidth())
        .toArray()
        .reduce((acc, current) => acc + current, 0);

      this.carouselEl.css('overflow', 'hidden');
      this.carouselEl.find('.carousel-item')
        .each((index, el) => {
          $(el).css({
            display: 'block',
            float: 'left',
            width: $(el).outerWidth()
          });
        });

      this.carouselEl.find('.carousel-inner')
        .width(totalWidth)
        .css({
          overflow: 'auto'
        });

      this.setState({
        carouselStyleUpdated: true
      });
    };

    resetCarouselStyle = () => {
      this.carouselEl.css('overflow', '');
      this.carouselEl.find('.carousel-item')
        .each((index, el) => {
          $(el).css({
            display: '',
            float: '',
            width: ''
          });
        });

      this.carouselEl.find('.carousel-inner')
        .width('auto')
        .css({
          overflow: ''
        });

      this.setState({
        carouselStyleUpdated: false
      });

      this.carouselInnerEl.css({
        transform: 'none'
      });
    };

    handleTouchMove = (e) => {
      const event = e.changedTouches[0];
      const targetCarousel = $(e.currentTarget);

      const deltaX = event.clientX - this.startX;
      const timeElapsedMilliSeconds = Math.max(Date.now() - this.startTime, 1);
      const speedPixelPerSecond = (Math.abs(deltaX) / timeElapsedMilliSeconds) * 1000;

      console.log('Touch move triggered', e.currentTarget, deltaX, speedPixelPerSecond);

      if (!this.state.carouselStyleUpdated) {
        this.updateCarouselStyle();
      }

      const currentTransform = this.carouselInnerEl.css('transform');
      let transformX;

      const activeSlideEl = this.activeSlideEl || this.carouselEl.find('.carousel-item.active');
      const width = activeSlideEl.outerWidth();
      const index = activeSlideEl.index();

      if (currentTransform !== 'none') {
        transformX = parseFloat(currentTransform.split(/[()]/)[1].replace(/\s/g, '').split(',')[4]);
      } else {
        transformX = -1 * index * width;
      }

      this.carouselInnerEl.css({
        transform: `translateX(${transformX + (deltaX / 12)}px)`
      });

      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      if (shouldSlide(deltaX, speedPixelPerSecond, this.threshold)
        || Math.abs(transformX - (index * width)) > 100) {

        this.debounceTimer = setTimeout(() => {
          const { state } = this;
          const carouselAction = deltaX > 0 ? 'prev' : 'next';

          console.log('debouncer triggered');
          // Reset pointer move event waiting for next touch event
          targetCarousel.off('touchmove', this.handleTouchMove);

          this.resetCarouselStyle();

          // Update state with new action
          this.setState({
            queue: [...state.queue, {
              action: carouselAction
            }]
          });

          clearTimeout(this.debounceTimer);
          this.debounceTimer = null;
          this.processCarouselSlideQueue(targetCarousel);
        }, DEBOUNCE_TIMEOUT);
      } else {
      }

    };

    handleCarouselSlideStart = () => {
      const { state } = this;

      // Remove processed first item from the queue
      this.setState({
        sliding: true,
        queue: state.queue.slice(1)
      });
    };

    handleCarouselSlideEnd = (e) => {
      const targetCarousel = $(e.target);

      this.setState({
        sliding: false
      });

      this.activeSlideEl = this.carouselEl.find('.carousel-item').eq(e.to);

      // Check the queue in case more slides needs to happen
      this.processCarouselSlideQueue(targetCarousel);
    };

    constructor(carouselEl, { sensitivity = 'medium', enabled = true } = {}) {
      this.carouselEl = carouselEl;
      this.carouselInnerEl = this.carouselEl.find('.carousel-inner');
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
        low: 25,
        medium: 50,
        high: 100
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
        this.carouselEl.on({
          pointerdown: this.handleTouchDown,
          'slide.bs.carousel': this.handleCarouselSlideStart,
          'slid.bs.carousel': this.handleCarouselSlideEnd
        });

        this.toggleEnabledState();
      }
    }

    disable() {
      if (this.state.enabled) {
        this.carouselEl.off({
          pointerdown: this.handleTouchDown,
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
