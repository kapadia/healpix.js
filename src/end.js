  
  function HEALPix() {
    
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
    
    this.longPtr = Module._malloc(4);
    this.vectorPtr = Module._malloc(24);
    this.thetaPtr = Module._malloc(8);
    this.phiPtr = Module._malloc(8);
  }
  
  function setVector(vec) {
    Module.setValue(this.vectorPtr, vec[0], 'double');
    Module.setValue(this.vectorPtr + 8, vec[1], 'double');
    Module.setValue(this.vectorPtr + 16, vec[2], 'double');
  }
  
  function getVector() {
    var x = Module.getValue(this.vectorPtr, 'double');
    var y = Module.getValue(this.vectorPtr + 8, 'double');
    var z = Module.getValue(this.vectorPtr + 16, 'double');
    
    return [x, y, z];
  }
  
  
  // void ang2vec(double theta, double phi, double *vec);
  HEALPix.prototype.ang2vec = function(theta, phi) {
    Module._ang2vec(theta, phi, this.vectorPtr);
    
    return getVector();
  }
  
  // void vec2ang(const double *vec, double *theta, double *phi);
  HEALPix.prototype.vec2ang = function(vec) {
    setVector(vec);
    Module._vec2ang(this.vectorPtr, this.thetaPtr, this.phiPtr);
    var theta = getValue(this.thetaPtr, 'double');
    var phi = getValue(this.phiPtr, 'double');
    
    return [theta, phi];
  }
  
  // void ang2pix_ring(long nside, double theta, double phi, long *ipix);
  HEALPix.prototype.ang2pix_ring = function(nside, theta, phi) {
    Module._ang2pix_ring(nside, theta, phi, this.longPtr);
    var ipix = getValue(this.longPtr, 'i32');
    
    return ipix;
  }
  
  // void ang2pix_nest(long nside, double theta, double phi, long *ipix);
  HEALPix.prototype.ang2pix_nest = function(nside, theta, phi) {
    Module._ang2pix_nest(nside, theta, phi, this.longPtr);
    var ipix = getValue(this.longPtr, 'i32');
    
    return ipix;
  }
  
  // void vec2pix_ring(long nside, const double *vec, long *ipix);
  HEALPix.prototype.vec2pix_ring = function(nside, vec) {
    setVector(vec);
    Module._vec2pix_ring(nside, this.vectorPtr, this.longPtr);
    var ipix = getValue(this.longPtr, 'i32');
    
    return ipix;
  }
  
  // void vec2pix_nest(long nside, const double *vec, long *ipix);
  HEALPix.prototype.vec2pix_nest = function(nside, vec) {
    setVector(vec);
    Module._vec2pix_nest(nside, this.vectorPtr, this.longPtr);
    var ipix = getValue(this.longPtr, 'i32');
    
    return ipix;
  }
  
  // void pix2ang_ring(long nside, long ipix, double *theta, double *phi);
  HEALPix.prototype.pix2ang_ring = function(nside, ipix) {
    Module._pix2ang_ring(nside, ipix, this.thetaPtr, this.phiPtr);
    var theta = getValue(this.thetaPtr, 'double');
    var phi = getValue(this.phiPtr, 'double');
    
    return [theta, phi];
  }
  
  // void pix2ang_nest(long nside, long ipix, double *theta, double *phi);
  HEALPix.prototype.pix2ang_nest = function(nside, ipix) {
    Module._pix2ang_nest(nside, ipix, this.thetaPtr, this.phiPtr);
    var theta = getValue(this.thetaPtr, 'double');
    var phi = getValue(this.phiPtr, 'double');
    
    return [theta, phi];
  }
  
  // void pix2vec_ring(long nside, long ipix, double *vec);
  HEALPix.prototype.pix2vec_ring = function(nside, ipix) {
    Module._pix2vec_ring(nside, ipix, this.vectorPtr);
    
    return getVector();
  }
  
  // void pix2vec_nest(long nside, long ipix, double *vec);
  HEALPix.prototype.pix2vec_nest = function(nside, ipix) {
    Module._pix2vec_nest(nside, ipix, this.vectorPtr);
    
    return getVector();
  }
  
  // void nest2ring(long nside, long ipnest, long *ipring);
  HEALPix.prototype.nest2ring = function(nside, ipnest) {
    Module._nest2ring(nside, ipnest, this.longPtr);
    var ipring = getValue(this.longPtr, 'i32');
    
    return ipring;
  }
  
  // void ring2nest(long nside, long ipring, long *ipnest);
  HEALPix.prototype.ring2nest = function(nside, ipring) {
    Module._ring2nest(nside, ipring, this.longPtr);
    var ipnest = getValue(this.longPtr, 'i32');
    
    return ipnest;
  }
  
  HEALPix.version = '0.1.0';
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HEALPix;
  }
  else {
    window.HEALPix = HEALPix;
  }

}());