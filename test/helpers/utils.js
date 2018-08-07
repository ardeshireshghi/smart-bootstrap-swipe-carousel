import 'babel-polyfill';
import $ from 'jquery';

const swipeEvent = async (type, carouselEl, swipeLength = 20) => {
  const startPos = 100;
  const humanSwipeDuration = 50; // milliseconds

  const swipePositions = {
    start: startPos,
    end: startPos + ((type === 'left') ? -1 : 1) * swipeLength
  };

  const fakePointerDownEvent = $.Event( 'pointerdown', { originalEvent: {
    clientX: swipePositions.start,
    pointerType: 'touch'
  }});

  const fakePointerMoveEvent = $.Event( 'pointermove', { originalEvent: {
    clientX: swipePositions.end,
    pointerType: 'touch'
  }});

  carouselEl.trigger(fakePointerDownEvent);
  await wait(humanSwipeDuration);
  return carouselEl.trigger(fakePointerMoveEvent);
};

export const swipeLeft = swipeEvent.bind(null, 'left');
export const swipeRight = swipeEvent.bind(null, 'right');

export const wait = async (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const getSimpleCarouselMarkup = ({ slides = 3, currentSlide = 1 } = {}) => {
  const carouselHTML = `<div id="carouselExampleSlidesOnly" \
  class="carousel slide" data-ride="carousel">
  <div class="carousel-inner">`;

  const slideContent = Array(slides).fill('').map((slide, index) => {
    return `<div class="carousel-item ${index === currentSlide - 1 ? 'active' : ''}">
    <img class="d-block w-100" src="..." alt="slide">
    </div>`;
  });

  return carouselHTML.concat(slideContent).concat('</div></div>');
};
