'use strict';

var fs = require('fs');
var path = require('path');
var HEALPix = require('../healpix');

exports['healpixjs_test'] = {
  setUp: function(done) {
    done();
  },
  
  '_nest2ring': function(test) {
    var hp = new HEALPix();
    var ring = hp.nest2ring(16, 1130);
    
    test.equal(ring, 1504);
    test.done();
  },
  
  '_ring2nest': function(test) {
    var hp = new HEALPix();
    var nest = hp.ring2nest(16, 1504);
    
    test.equal(nest, 1130);
    test.done();
  }

};
