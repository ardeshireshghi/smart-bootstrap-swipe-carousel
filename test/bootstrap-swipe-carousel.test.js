import bootstrap from 'bootstrap';
import $ from 'jquery';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import { getSimpleCarouselMarkup, swipeLeft, swipeRight, wait } from './helpers/utils';

chai.should();
chai.use(sinonChai);

// Import carousel module
import BootstrapSwipeCarousel from'../src/bootstrap-swipe-carousel';

describe('Bootstrap Swipe Carousel', () => {
  beforeEach(() => {
    $('body').html(getSimpleCarouselMarkup());
    window.PointerEvent = {};
  });

  it('should store the swipe carousel object in element data', () => {
    const carouselEl = $('.carousel');
    carouselEl.carousel().swipeCarousel();
    expect(carouselEl.data(BootstrapSwipeCarousel.CAROUSEL_DATA_KEY))
      .to.be.instanceof(BootstrapSwipeCarousel);
  });

  describe('When Swipe left', () => {
    it('should go to next slide', (done) => {
      const carouselEl = $('.carousel');
      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium' // Threshold is 8 pixels
      });

      swipeLeft(carouselEl);

      carouselEl.on('slid.bs.carousel', ({from, to}) => {
        expect(from).to.eq(0);
        expect(to).to.eq(1);

        expect(carouselEl.find('.carousel-item.active').index()).to.eq(1);
        done();
      });
    });

    it('should not go to next slide when swipe is less than Threshold', async () => {
      const carouselEl = $('.carousel');
      const safeWaitTime = 200;
      const swipeMovePixels = 3;
      const currentSlide = 0;

      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium' // Threshold is 8 pixels
      });

      await swipeLeft(carouselEl, { swipeLength: swipeMovePixels});
      await wait(safeWaitTime);

      expect(carouselEl.find('.carousel-item.active').index()).to.eq(currentSlide);
    });

    describe('When pointer events are not defined', () => {
      let cachedPointerEventConstructor;

      beforeEach(() => {
        delete window.PointerEvent;
      });

      it('should work with touch events and go to next slide', (done) => {
        const carouselEl = $('.carousel');
        carouselEl.carousel().swipeCarousel({
          sensitivity: 'medium' // Threshold is 8 pixels
        });

        swipeLeft(carouselEl, { eventType: 'touch' });

        carouselEl.on('slid.bs.carousel', ({from, to}) => {
          expect(from).to.eq(0);
          expect(to).to.eq(1);

          expect(carouselEl.find('.carousel-item.active').index()).to.eq(1);
          done();
        });
      });
    })

  });

  describe('When swipe right', () => {
    it('should move to slide 2 from slide 3', (done) => {
      $('body').html(getSimpleCarouselMarkup({
        slides: 3,
        currentSlide: 3
      }));

      const carouselEl = $('.carousel');
      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium' // Threshold is 8 pixels
      });

      swipeRight(carouselEl);

      carouselEl.on('slid.bs.carousel', ({from, to}) => {
        expect(from).to.eq(2);
        expect(to).to.eq(1);

        expect(carouselEl.find('.carousel-item.active').index()).to.eq(1);
        done();
      });
    });

    it('should stay on slide 3 when swipe is less than Threshold', async () => {
      const currentSlideIndex = 2;

      $('body').html(getSimpleCarouselMarkup({
        slides: 3,
        currentSlide: currentSlideIndex + 1
      }));

      const carouselEl = $('.carousel');
      const safeWaitTime = 200;
      const swipeMovePixels = 3;

      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium' // Threshold is 8 pixels
      });

      await swipeRight(carouselEl, { swipeLength: swipeMovePixels });
      await wait(safeWaitTime);

      expect(carouselEl.find('.carousel-item.active').index()).to.eq(currentSlideIndex);
    });
  });

  describe('When disabled', () => {
    it('should not change slide upon swiping', async () => {
      const carouselEl = $('.carousel');
      const safeWaitTime = 200;
      const swipeMovePixels = 3;
      const currentSlide = 0;

      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium'
      });

      carouselEl.swipeCarousel('disable');

      await swipeLeft(carouselEl, { swipeLength: swipeMovePixels });
      await wait(safeWaitTime);
      expect(carouselEl.find('.carousel-item.active').index()).to.eq(currentSlide);
    });

    it('should change slide after re-enabling upon swiping', (done) => {
      const carouselEl = $('.carousel');
      const safeWaitTime = 200;
      const swipeMovePixels = 3;
      const currentSlide = 0;

      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium',
        enabled: false
      });

      carouselEl.swipeCarousel('enable');

      swipeLeft(carouselEl);

      carouselEl.on('slid.bs.carousel', ({from, to}) => {
        expect(from).to.eq(0);
        expect(to).to.eq(1);

        expect(carouselEl.find('.carousel-item.active').index()).to.eq(1);
        done();
      });
    });
  });

  describe('When enabled', () => {
    it('should not bind more event listeners', async () => {
      const carouselEl = $('.carousel');
      const safeWaitTime = 200;
      const swipeMovePixels = 3;
      let eventSpy;

      carouselEl.carousel();

      eventSpy = sinon.spy($.fn, 'on');

      carouselEl.swipeCarousel({
        sensitivity: 'medium'
      });

      carouselEl.swipeCarousel('enable');

      await wait(safeWaitTime);

      expect(eventSpy).to.have.been.calledOnce;
      $.fn.on.restore();
    });

    it('should not change slide after disabling', async () => {
      const carouselEl = $('.carousel');
      const safeWaitTime = 500;
      const swipeMovePixels = 3;
      const currentSlide = 0;

      const slideChangeHandler = sinon.spy();
      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium'
      });

      carouselEl.on('slid.bs.carousel', slideChangeHandler);
      carouselEl.swipeCarousel('disable');

      await swipeLeft(carouselEl, { swipeLength: swipeMovePixels});
      await wait(safeWaitTime);
      expect(slideChangeHandler).to.not.been.called;
    });
  });

  describe('Multiple swipes', () => {
    it('should go from slide 1 to 3 after 2 swipe left with enough delay', (done) => {
      $('body').html(getSimpleCarouselMarkup({
        slides: 3,
        currentSlide: 1
      }));

      let slideFinishEventCallCount = 0;
      const carouselEl = $('.carousel');

      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium' // Threshold is 8 pixels
      });

      const slideChangeHandlerSpy = sinon.spy();

      const checkSlideChangeSpy = () => {
        expect(slideChangeHandlerSpy.calledTwice).to.be.true;

        const expectedArgsPerCall = [
          {
            from: 0,
            to: 1
          },
          {
            from: 1,
            to: 2
          }
        ];

        expectedArgsPerCall.forEach(({from, to}) => {
          expect(slideChangeHandlerSpy).to.have.been.calledWithMatch({from, to});
        });
      };

      carouselEl.on('slid.bs.carousel', slideChangeHandlerSpy);
      carouselEl.on('slid.bs.carousel', () => {
        slideFinishEventCallCount += 1;

        if (slideFinishEventCallCount === 2) {
          checkSlideChangeSpy();
          done();
        }
      });

      // First swipe
      swipeLeft(carouselEl)
        .then(() => wait(BootstrapSwipeCarousel.DEBOUNCE_WAIT + 10))
        .then(() => swipeLeft(carouselEl));
    });

    it('should only go from slide 1 to 2 after 2 swipe left with no delay', async () => {
      $('body').html(getSimpleCarouselMarkup({
        slides: 3,
        currentSlide: 1
      }));

      const longEnoughWait = 1000;
      let slideFinishEventCallCount = 0;

      const carouselEl = $('.carousel');
      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium' // Threshold is 8 pixels
      });

      const slideChangeHandlerSpy = sinon.spy();

      carouselEl.on('slid.bs.carousel', slideChangeHandlerSpy);

      // First swipe and second no delay
      await swipeLeft(carouselEl);
      await swipeLeft(carouselEl);

      await wait(longEnoughWait);

      expect(slideChangeHandlerSpy.calledOnce).to.be.true;
      expect(slideChangeHandlerSpy).to.have.been.calledWithMatch({
        from: 0,
        to: 1
      });
    });
  });
});
