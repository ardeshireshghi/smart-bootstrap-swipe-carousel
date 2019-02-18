import bootstrap from 'bootstrap';
import $ from 'jquery';

import Carousel from '../src/bootstrap-swipe-carousel';

$(() => {
  $('.js-carousel').carousel().swipeCarousel();
});

