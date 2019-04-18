requirejs.config({
  paths: {
    // ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min',
  },
});

const compose = (f, g) => x => f(g(x));

const map = f => xs => xs.map(f);

const prop = attr => obj => obj[attr];

require([
    // 'ramda',
    'jquery',
  ],
  function(/*_,*/ $) {
    ////////////////////////////////////////////
    // Utils

    var Impure = {
      getJSON: callback => url => {
        $.getJSON(url, callback);
      },

      setHtml: sel => html => {
        $(sel).html(html);
      },
    };

    var img = function(url) {
      return $('<img />', {
        src: url,
        click: () => { window.location.href = url; },
        css: { cursor: 'pointer' },
      });
    };

    var trace = tag => x => {
      console.log(tag, x);
      return x;
    };

    ////////////////////////////////////////////

    var url = function(t) {
      return 'http://api.flickr.com/services/feeds/photos_public.gne?tags=' +
        t + '&format=json&jsoncallback=?';
    };


    const ddata = {
      "items": [
  	   {
  			"media": {"m":"https:\/\/live.staticflickr.com\/65535\/40654970983_a19a4b6699_m.jpg"},
  	   },
  	   {
  			"media": {"m":"https:\/\/live.staticflickr.com\/7816\/32671123767_317df1bea4_m.jpg"},
  	   }
     ],
    };

    var mediaUrl_orig = compose(prop('m'), prop('media'));  // mappatore per items

    const mediaUrl = obj => prop('m')(prop('media')(obj));

    var srcs_orig = compose(map(mediaUrl), prop('items'));

    const srcs = x => map(obj => prop('m')(prop('media')(obj)))(prop('items')(x));

    var images_orig = compose(map(img), srcs);

    var imagesa = compose(map(img), compose(map(mediaUrl), prop('items')));

    var imagesb = composeN(map(img), map(mediaUrl), prop('items'));

    var imagesc = compose(map(compose(img, mediaUrl)), prop('items'));

    const objToImage = compose(img, mediaUrl);

    var images = compose(map(objToImage), prop('items'));

    const imageszzz = ys => map(img)((x => map(obj => prop('m')(prop('media')(obj)))(prop('items')(x)))(ys));

    // var law = compose(map(f), map(g)) === map(compose(f, g));

    var renderImages_orig = compose(Impure.setHtml('body'), images);

    var renderImagesa = data => { Impure.setHtml('body')(images(data)); };

    var renderImagesb = data => { Impure.setHtml('body')((ys => map(img)((x => map(obj => prop('m') (prop('media')(obj))) (prop('items')(x)) )(ys)))(data)); };

    var renderImages = data => { Impure.setHtml('body')((ys => map(img)((x => map(obj => prop('m') (prop('media')(obj))) (prop('items')(x)) )(ys)))(data)); };

    var app = compose(Impure.getJSON(renderImages), url);

    app('a-10');
  });

function composeN() {
  const argz = arguments;
  return x => [...argz].reduceRight((acc, curr) => curr(acc), x);
}
