import assert from './assert';
import zeros from './zeros'

// Mat holds a matrix
var Mat = function(n,d) {
  // n is number of rows d is number of columns
  this.n = n;
  this.d = d;
  this.w = zeros(n * d);
  this.dw = zeros(n * d);
}
Mat.prototype = {
  get: function(row, col) {
    // slow but careful accessor function
    // we want row-major order
    var ix = (this.d * row) + col;
    assert(ix >= 0 && ix < this.w.length);
    return this.w[ix];
  },
  set: function(row, col, v) {
    // slow but careful accessor function
    var ix = (this.d * row) + col;
    assert(ix >= 0 && ix < this.w.length);
    this.w[ix] = v;
  },
  setFrom: function(arr) {
    for(var i=0,n=arr.length;i<n;i++) {
      this.w[i] = arr[i];
    }
  },
  setColumn: function(m, i) {
    for(var q=0,n=m.w.length;q<n;q++) {
      this.w[(this.d * q) + i] = m.w[q];
    }
  },
  toJSON: function() {
    var json = {};
    json['n'] = this.n;
    json['d'] = this.d;
    json['w'] = this.w;
    return json;
  },
  fromJSON: function(json) {
    this.n = json.n;
    this.d = json.d;
    this.w = zeros(this.n * this.d);
    this.dw = zeros(this.n * this.d);
    for(var i=0,n=this.n * this.d;i<n;i++) {
      this.w[i] = json.w[i]; // copy over weights
    }
  }
}


var copyMat = function(b) {
  var a = new Mat(b.n, b.d);
  a.setFrom(b.w);
  return a;
}

var copyNet = function(net) {
  // nets are (k,v) pairs with k = string key, v = Mat()
  var new_net = {};
  for(var p in net) {
    if(net.hasOwnProperty(p)){
      new_net[p] = copyMat(net[p]);
    }
  }
  return new_net;
}

var updateMat = function(m, alpha) {
  // updates in place
  for(var i=0,n=m.n*m.d;i<n;i++) {
    if(m.dw[i] !== 0) {
      m.w[i] += - alpha * m.dw[i];
      m.dw[i] = 0;
    }
  }
}

var updateNet = function(net, alpha) {
  for(var p in net) {
    if(net.hasOwnProperty(p)){
      updateMat(net[p], alpha);
    }
  }
}



export default Mat;

export {
  copyMat,
  copyNet,
  updateMat,
  updateNet
}
