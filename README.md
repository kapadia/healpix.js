
# HEALPix in JavaScript

## Example

    var hp = new HEALPix();
    var ring = hp.nest2ring(16, 1130);
    var nest = hp.ring2nest(16, 1504);

## License

The JS code in this package has license MIT.
However, note that this is a wrapper around the HEALPix C++ library, which is GPL.
So if you use this, overall the GPL license applies.
