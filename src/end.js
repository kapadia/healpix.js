  
  function HEALPix() {
    // void nest2ring(long nside, long ipnest, long *ipring)
    // void ring2nest(long nside, long ipring, long *ipnest)
    this._nest2ring = Module.cwrap('nest2ring', '', ['number', 'number', 'number']);
    this._ring2nest = Module.cwrap('ring2nest', '', ['number', 'number', 'number']);
    
    this.longPtr = Module._malloc(4);
  }
  
  HEALPix.prototype.nest2ring = function(nside, ipnest) {
    this._nest2ring(nside, ipnest, this.longPtr);
    
    var ipring = new Uint32Array(Module.HEAPU8.buffer, this.longPtr, 1);
    return ipring[0];
  }
  
  HEALPix.prototype.ring2nest = function(nside, ipring) {
    this._ring2nest(nside, ipring, this.longPtr);
    var ipnest = new Uint32Array(Module.HEAPU8.buffer, this.longPtr, 1);
    
    return ipnest[0];
  }
  
  HEALPix.version = '0.0.1';
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HEALPix;
  }
  else {
    window.HEALPix = HEALPix;
  }

}());