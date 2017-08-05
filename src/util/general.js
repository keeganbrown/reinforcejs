import assert from './assert';

// syntactic sugar function for getting default parameter values
var getopt = function(opt, field_name, default_value) {
  if( !opt || !field_name || !opt.hasOwnProperty(field_name)) {
    return default_value;
  }
  return opt[field_name];
}

var setConst = function(arr, c) {
  for(var i=0,n=arr.length;i<n;i++) {
    arr[i] = c;
  }
}

var sampleWeighted = function(p) {
  var r = Math.random();
  var c = 0.0;
  for(var i=0,n=p.length;i<n;i++) {
    c += p[i];
    if(c >= r) { return i; }
  }
  assert(false, 'wtf');
}


export {
  getopt,
  setConst,
  sampleWeighted
}
