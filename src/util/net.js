

var netToJSON = function(net) {
  var j = {};
  for(var p in net) {
    if(net.hasOwnProperty(p)){
      j[p] = net[p].toJSON();
    }
  }
  return j;
}
var netFromJSON = function(j) {
  var net = {};
  for(var p in j) {
    if(j.hasOwnProperty(p)){
      net[p] = new Mat(1,1); // not proud of this
      net[p].fromJSON(j[p]);
    }
  }
  return net;
}
var netZeroGrads = function(net) {
  for(var p in net) {
    if(net.hasOwnProperty(p)){
      var mat = net[p];
      gradFillConst(mat, 0);
    }
  }
}
var netFlattenGrads = function(net) {
  var n = 0;
  for(var p in net) { if(net.hasOwnProperty(p)){ var mat = net[p]; n += mat.dw.length; } }
  var g = new Mat(n, 1);
  var ix = 0;
  for(var p in net) {
    if(net.hasOwnProperty(p)){
      var mat = net[p];
      for(var i=0,m=mat.dw.length;i<m;i++) {
        g.w[ix] = mat.dw[i];
        ix++;
      }
    }
  }
  return g;
}
