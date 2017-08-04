

var initLSTM = function(input_size, hidden_sizes, output_size) {
  // hidden size should be a list

  var model = {};
  for(var d=0;d<hidden_sizes.length;d++) { // loop over depths
    var prev_size = d === 0 ? input_size : hidden_sizes[d - 1];
    var hidden_size = hidden_sizes[d];

    // gates parameters
    model['Wix'+d] = new RandMat(hidden_size, prev_size , 0, 0.08);
    model['Wih'+d] = new RandMat(hidden_size, hidden_size , 0, 0.08);
    model['bi'+d] = new Mat(hidden_size, 1);
    model['Wfx'+d] = new RandMat(hidden_size, prev_size , 0, 0.08);
    model['Wfh'+d] = new RandMat(hidden_size, hidden_size , 0, 0.08);
    model['bf'+d] = new Mat(hidden_size, 1);
    model['Wox'+d] = new RandMat(hidden_size, prev_size , 0, 0.08);
    model['Woh'+d] = new RandMat(hidden_size, hidden_size , 0, 0.08);
    model['bo'+d] = new Mat(hidden_size, 1);
    // cell write params
    model['Wcx'+d] = new RandMat(hidden_size, prev_size , 0, 0.08);
    model['Wch'+d] = new RandMat(hidden_size, hidden_size , 0, 0.08);
    model['bc'+d] = new Mat(hidden_size, 1);
  }
  // decoder params
  model['Whd'] = new RandMat(output_size, hidden_size, 0, 0.08);
  model['bd'] = new Mat(output_size, 1);
  return model;
}

var forwardLSTM = function(G, model, hidden_sizes, x, prev) {
  // forward prop for a single tick of LSTM
  // G is graph to append ops to
  // model contains LSTM parameters
  // x is 1D column vector with observation
  // prev is a struct containing hidden and cell
  // from previous iteration

  if(prev == null || typeof prev.h === 'undefined') {
    var hidden_prevs = [];
    var cell_prevs = [];
    for(var d=0;d<hidden_sizes.length;d++) {
      hidden_prevs.push(new R.Mat(hidden_sizes[d],1));
      cell_prevs.push(new R.Mat(hidden_sizes[d],1));
    }
  } else {
    var hidden_prevs = prev.h;
    var cell_prevs = prev.c;
  }

  var hidden = [];
  var cell = [];
  for(var d=0;d<hidden_sizes.length;d++) {

    var input_vector = d === 0 ? x : hidden[d-1];
    var hidden_prev = hidden_prevs[d];
    var cell_prev = cell_prevs[d];

    // input gate
    var h0 = G.mul(model['Wix'+d], input_vector);
    var h1 = G.mul(model['Wih'+d], hidden_prev);
    var input_gate = G.sigmoid(G.add(G.add(h0,h1),model['bi'+d]));

    // forget gate
    var h2 = G.mul(model['Wfx'+d], input_vector);
    var h3 = G.mul(model['Wfh'+d], hidden_prev);
    var forget_gate = G.sigmoid(G.add(G.add(h2, h3),model['bf'+d]));

    // output gate
    var h4 = G.mul(model['Wox'+d], input_vector);
    var h5 = G.mul(model['Woh'+d], hidden_prev);
    var output_gate = G.sigmoid(G.add(G.add(h4, h5),model['bo'+d]));

    // write operation on cells
    var h6 = G.mul(model['Wcx'+d], input_vector);
    var h7 = G.mul(model['Wch'+d], hidden_prev);
    var cell_write = G.tanh(G.add(G.add(h6, h7),model['bc'+d]));

    // compute new cell activation
    var retain_cell = G.eltmul(forget_gate, cell_prev); // what do we keep from cell
    var write_cell = G.eltmul(input_gate, cell_write); // what do we write to cell
    var cell_d = G.add(retain_cell, write_cell); // new cell contents

    // compute hidden state as gated, saturated cell activations
    var hidden_d = G.eltmul(output_gate, G.tanh(cell_d));

    hidden.push(hidden_d);
    cell.push(cell_d);
  }

  // one decoder to outputs at end
  var output = G.add(G.mul(model['Whd'], hidden[hidden.length - 1]),model['bd']);

  // return cell memory, hidden representation and output
  return {'h':hidden, 'c':cell, 'o' : output};
}

export {
  initLSTM,
  forwardLSTM
}
