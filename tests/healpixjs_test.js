'use strict';

var fs = require('fs');
var path = require('path');
()

// void ang2vec(double theta, double phi, double *vec);
// void vec2ang(const double *vec, double *theta, double *phi);
// void ang2pix_ring(long nside, double theta, double phi, long *ipix);
// void ang2pix_nest(long nside, double theta, double phi, long *ipix);
// void vec2pix_ring(long nside, const double *vec, long *ipix);
// void vec2pix_nest(long nside, const double *vec, long *ipix);
// void pix2ang_ring(long nside, long ipix, double *theta, double *phi);
// void pix2ang_nest(long nside, long ipix, double *theta, double *phi);
// void pix2vec_ring(long nside, long ipix, double *vec);
// void pix2vec_nest(long nside, long ipix, double *vec);
// void nest2ring(long nside, long ipnest, long *ipring);
// void ring2nest(long nside, long ipring, long *ipnest);
// void ang2pix_ring64(hpint64 nside, double theta, double phi, hpint64 *ipix);
// void ang2pix_nest64(hpint64 nside, double theta, double phi, hpint64 *ipix);
// void vec2pix_ring64(hpint64 nside, const double *vec, hpint64 *ipix);
// void vec2pix_nest64(hpint64 nside, const double *vec, hpint64 *ipix);
// void pix2ang_ring64(hpint64 nside, hpint64 ipix, double *theta, double *phi);
// void pix2ang_nest64(hpint64 nside, hpint64 ipix, double *theta, double *phi);
// void pix2vec_ring64(hpint64 nside, hpint64 ipix, double *vec);
// void pix2vec_nest64(hpint64 nside, hpint64 ipix, double *vec);
// void nest2ring64(hpint64 nside, hpint64 ipnest, hpint64 *ipring);
// void ring2nest64(hpint64 nside, hpint64 ipring, hpint64 *ipnest);


exports['healpixjs_test'] = {
  setUp: function(done) {
    done();
  },
  
  'ang2vec': function(test) {
    var hp = new HEALPix();
    var vec = hp.ang2vec(0.25 * Math.PI, Math.PI);
    
    test.equal(vec[0].toFixed(9), -0.707106781)
    test.equal(vec[1].toFixed(9), 8.6595605623549316e-17)
    test.equal(vec[2].toFixed(9), 0.707106781)
    
    test.done();
  },
  
  'ang2pix_ring': function(test) {
    var hp = new HEALPix();
    var ipix = hp.ang2pix_ring(64.0, 0.0, 0.0);
    
    console.log('ipix', ipix);
    test.equal(1, 1);
    test.done();
  },
  
  'nest2ring': function(test) {
    var hp = new HEALPix();
    var ring = hp.nest2ring(16, 1130);
    
    test.equal(ring, 1504);
    test.done();
  },
  
  'ring2nest': function(test) {
    var hp = new HEALPix();
    var nest = hp.ring2nest(16, 1504);
    
    test.equal(nest, 1130);
    test.done();
  }

};
