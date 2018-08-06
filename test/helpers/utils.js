const $ = require('jquery');

const swipeEvent = (type, carouselEl, swipeLength = 20) => {
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

  return new Promise((resolve) => {
    setTimeout(() => {
      carouselEl.trigger(fakePointerMoveEvent);
      resolve();
    }, humanSwipeDuration);
  });
};

exports.swipeLeft = swipeEvent.bind(null, 'left');
exports.swipeRight = swipeEvent.bind(null, 'right');

exports.getSimpleCarouselMarkup = ({ slides = 3, currentSlide = 1 } = {}) => {
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
