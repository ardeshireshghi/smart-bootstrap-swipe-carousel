# smart-bootstrap-swipe-carousel

Adds smart swipe feature, allows moving your slider on mobile devices by swiping. What is difference with this carousel plugin is the ability to do multiple swipes and it will change the slides accordingly.

By default, bootstrap carousel does not allow changing the slide while it is sliding.

See [Demo](https://beyondtech.agency)

## Dependencies

1. jQuery
2. Bootstrap 3 or 4 (Depends on jQuery and Popper.js)


## Usage

It can be used with Browserify, Webpack as well as embedded in the browser.

### ES6

```javascript
import $ from 'jquery';
import bootstrap from 'bootstrap';
import BootstrapSwipeCarousel from 'smart-bootstrap-swipe-carousel';

const carouselEl = $('.my-carousel');

// Bootstrap carousel needs to be loaded first
carouselEl.carousel().swipeCarousel({
  sensitivity: 'high' // low, medium or high
});
```
### ES5

```javascript
const $ = require('jquery');
require('bootstrap');
require('smart-bootstrap-swipe-carousel');

const carouselEl = $('.my-carousel');

// Bootstrap carousel needs to be loaded first
carouselEl.carousel().swipeCarousel({
  sensitivity: 'high' // low, medium or high
});
```

### Embed in HTML

Download the [dist/bootstrap-swipe-carousel.min.js](https://raw.githubusercontent.com/ardeshireshghi/smart-bootstrap-swipe-carousel/master/dist/bootstrap-swipe-carousel.min.js)
and store it in your project. Make sure you add the script tag after `jquery.js` and `bootstrap.js`:

```html
<script src="js/bootstrap-swipe-carousel.min.js" type="text/javascript"></script>
```

## Development

If you are insterested to contribute, fork the repository and start adding changes to make this cooler. Create an issue and let's have a chat before doing anything. After forking:

### Tests
```
npm install
npm run watch
```

`npm run watch` uses Mocha with JSDom to run the tests upon changes in the test file. This allows TDDing.

### Syntax checks and Coverage

Use `npm run lint` to check the style and `npm run coverage` to see the test coverage:

```console
=============================== Coverage summary ===============================
Statements   : 100% ( 70/70 )
Branches     : 87.5% ( 28/32 )
Functions    : 100% ( 17/17 )
Lines        : 100% ( 69/69 )
================================================================================
```
 In order for any change to get merged, Branches coverage should be above 80% and the rest should be 100%.

