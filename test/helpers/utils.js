import 'babel-polyfill';
import $ from 'jquery';

const touchEvent = ({ type, pageX } = {}) => $.Event(`touch${type}`, {
  originalEvent: {
    touches: [
      {
        pageX
      }
    ],
    type: `touch${type}`
  }
});


const pointerTouchEvent = ({ type, clientX }) => $.Event( `pointer${type}`, {
  originalEvent: {
    clientX,
    pointerType: 'touch',
    type: `pointer${type}`
  }
});

const swipeEvent = async (type, carouselEl, { swipeLength = 20, eventType = 'pointer' } = {}) => {
  const startPos = 100;
  const humanSwipeDuration = 50; // milliseconds
  let touchStartEvent;
  let touchMoveEvent;

  const swipePositions = {
    start: startPos,
    end: startPos + ((type === 'left') ? -1 : 1) * swipeLength
  };

  if (eventType === 'pointer') {
    touchStartEvent = pointerTouchEvent({ type: 'down', clientX: swipePositions.start });
    touchMoveEvent = pointerTouchEvent({ type: 'move', clientX: swipePositions.end });
  } else if (eventType === 'touch') {
    touchStartEvent = touchEvent({ type: 'start', pageX: swipePositions.start });
    touchMoveEvent = touchEvent({ type: 'move', pageX: swipePositions.end });
  }

  carouselEl.trigger(touchStartEvent);
  await wait(humanSwipeDuration);
  return carouselEl.trigger(touchMoveEvent);
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
