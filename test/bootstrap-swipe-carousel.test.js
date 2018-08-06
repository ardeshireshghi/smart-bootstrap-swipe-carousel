const bootstrap = require('bootstrap');
const $ = require('jquery');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

chai.should();
chai.use(sinonChai);

window.$ = $;

const { getSimpleCarouselMarkup, swipeLeft, swipeRight } = require('./helpers/utils');
const BootstrapSwipeCarousel = require('../src/bootstrap-swipe-carousel');

describe('Bootstrap Swipe Carousel', () => {
  beforeEach(() => {
    $('body').html(getSimpleCarouselMarkup());
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

    it('should not go to next slide when swipe is less than Threshold', (done) => {
      const carouselEl = $('.carousel');
      const safeWaitTime = 200;
      const swipeMovePixels = 3;
      const currentSlide = 0;

      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium' // Threshold is 8 pixels
      });

      swipeLeft(carouselEl, swipeMovePixels).then(() => {
        setTimeout(() => {
          expect(carouselEl.find('.carousel-item.active').index()).to.eq(currentSlide);
          done();
        }, safeWaitTime);
      });
    });
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

    it('should stay on slide 3 when swipe is less than Threshold', (done) => {
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

      swipeRight(carouselEl, swipeMovePixels).then(() => {
        setTimeout(() => {
          expect(carouselEl.find('.carousel-item.active').index()).to.eq(currentSlideIndex);
          done();
        }, safeWaitTime);
      });
    });
  });

  describe('When disabled', () => {
    it('should not change slide upon swiping', (done) => {
      const carouselEl = $('.carousel');
      const safeWaitTime = 200;
      const swipeMovePixels = 3;
      const currentSlide = 0;

      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium'
      });

      carouselEl.swipeCarousel('disable');

      swipeLeft(carouselEl, swipeMovePixels).then(() => {
        setTimeout(() => {
          expect(carouselEl.find('.carousel-item.active').index()).to.eq(currentSlide);
          done();
        }, safeWaitTime);
      });
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

  describe('Multiple swipes', () => {
    it('should go from slide 1 to 3 after 2 swipe left with enough delay', (done) => {
      $('body').html(getSimpleCarouselMarkup({
        slides: 3,
        currentSlide: 1
      }));

      let slideFinishCalls = 0;

      const carouselEl = $('.carousel');
      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium' // Threshold is 8 pixels
      });

      const slideChangeHandlerSpy = sinon.spy();

      carouselEl.on('slid.bs.carousel', slideChangeHandlerSpy);
      carouselEl.on('slid.bs.carousel',() => {
        slideFinishCalls += 1;

        if (slideFinishCalls === 2) {
          expect(slideChangeHandlerSpy.calledTwice).to.be.true;

          expect(slideChangeHandlerSpy).to.have.been.calledWithMatch({
            from: 0,
            to: 1
          });

          expect(slideChangeHandlerSpy).to.have.been.calledWithMatch({
            from: 1,
            to: 2
          });

          done();
        }
      });

      // First swipe
      swipeLeft(carouselEl).then(() => {
        // Wait to bypass the debouncer and second swipe
        setTimeout(() => swipeLeft(carouselEl), BootstrapSwipeCarousel.DEBOUNCE_WAIT + 10);
      });
    });

    it('should only go from slide 1 to 2 after 2 swipe left with no delay', (done) => {
      $('body').html(getSimpleCarouselMarkup({
        slides: 3,
        currentSlide: 1
      }));

      const longEnoughWait = 1000;
      let slideFinishCalls = 0;

      const carouselEl = $('.carousel');
      carouselEl.carousel().swipeCarousel({
        sensitivity: 'medium' // Threshold is 8 pixels
      });

      const slideChangeHandlerSpy = sinon.spy();

      carouselEl.on('slid.bs.carousel', slideChangeHandlerSpy);
      setTimeout(() => {
        expect(slideChangeHandlerSpy.calledOnce).to.be.true;
        expect(slideChangeHandlerSpy).to.have.been.calledWithMatch({
          from: 0,
          to: 1
        });

        done();

      }, longEnoughWait);

      // First swipe and second no delay
      swipeLeft(carouselEl)
        .then(() => { swipeLeft(carouselEl) });
    });
  });
});
