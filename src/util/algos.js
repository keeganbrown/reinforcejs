import {
  randf,
} from '../util/randoms';

var sig = function(x) {
  // helper function for computing sigmoid
  return 1.0/(1+Math.exp(-x));
}

var maxi = function(w) {
  // argmax of array w
  var maxv = w[0];
  var maxix = 0;
  for(var i=1,n=w.length;i<n;i++) {
    var v = w[i];
    if(v > maxv) {
      maxix = i;
      maxv = v;
    }
  }
  return maxix;
}

var samplei = function(w) {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  var r = randf(0,1);
  var x = 0.0;
  var i = 0;
  while(true) {
    x += w[i];
    if(x > r) { return i; }
    i++;
  }
  return w.length - 1; // pretty sure we should never get here?
}


var softmax = function(m) {
  var out = new Mat(m.n, m.d); // probability volume
  var maxval = -999999;
  for(var i=0,n=m.w.length;i<n;i++) { if(m.w[i] > maxval) maxval = m.w[i]; }

  var s = 0.0;
  for(var i=0,n=m.w.length;i<n;i++) {
    out.w[i] = Math.exp(m.w[i] - maxval);
    s += out.w[i];
  }
  for(var i=0,n=m.w.length;i<n;i++) { out.w[i] /= s; }

  // no backward pass here needed
  // since we will use the computed probabilities outside
  // to set gradients directly on m
  return out;
}

export {
  softmax,
  sig,
  maxi,
  samplei
};
