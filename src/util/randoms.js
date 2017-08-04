import Mat from './matrix.js';

// Random numbers utils
var return_v = false;
var v_val = 0.0;
var gaussRandom = function() {
  if(return_v) {
    return_v = false;
    return v_val;
  }
  var u = 2*Math.random()-1;
  var v = 2*Math.random()-1;
  var r = u*u + v*v;
  if(r == 0 || r > 1) return gaussRandom();
  var c = Math.sqrt(-2*Math.log(r)/r);
  v_val = v*c; // cache this
  return_v = true;
  return u*c;
}
var randf = function(a, b) { return Math.random()*(b-a)+a; }
var randi = function(a, b) { return Math.floor(Math.random()*(b-a)+a); }
var randn = function(mu, std){ return mu+gaussRandom()*std; }

// return Mat but filled with random numbers from gaussian
var RandMat = function(n,d,mu,std) {
  var m = new Mat(n, d);
  fillRandn(m,mu,std);
  //fillRand(m,-std,std); // kind of :P
  return m;
}

// Mat utils
// fill matrix with random gaussian numbers
var fillRandn = function(m, mu, std) { for(var i=0,n=m.w.length;i<n;i++) { m.w[i] = randn(mu, std); } }
var fillRand = function(m, lo, hi) { for(var i=0,n=m.w.length;i<n;i++) { m.w[i] = randf(lo, hi); } }
var gradFillConst = function(m, c) { for(var i=0,n=m.dw.length;i<n;i++) { m.dw[i] = c } }


export {
  gaussRandom,
  randf,
  randn,
  randi,
  RandMat,
  fillRandn,
  fillRand,
  gradFillConst
}
