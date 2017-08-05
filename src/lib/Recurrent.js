
import assert from '../util/assert';
import {
  gaussRandom,
  randf,
  randn,
  randi,
  RandMat,
  fillRandn,
  fillRand,
  gradFillConst
} from '../util/randoms';
import zeros from '../util/zeros';
import Mat from '../util/matrix';
import Graph from '../util/graph';
import Solver from '../util/solver';
import {
  softmax
} from '../util/algos';
import {
  initLSTM,
  forwardLSTM
} from '../util/lstm';
import {
  netToJSON,
  netFromJSON,
  netZeroGrads,
  netFlattenGrads
} from '../util/net';


const Recurrent = {
  // various utils
  assert,
  zeros,
  maxi,
  samplei,
  randi,
  randn,
  softmax,
  // classes
  Mat,
  RandMat,
  forwardLSTM,
  initLSTM,
  // more utils
  updateMat,
  updateNet,
  copyMat,
  copyNet,
  netToJSON,
  netFromJSON,
  netZeroGrads,
  netFlattenGrads,
  // optimization
  Solver,
  Graph
}; // the Recurrent library

export default Recurrent;
