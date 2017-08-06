
let W = 600, H = 600;
let d3line = null;
let d3agent = null;
let d3target = null;
let d3target2 = null;
let d3target2_radius = null;
let initDraw = function() {
  let d3elt = d3.select('#draw');
  d3elt.html('');

  let w = 600;
  let h = 600;
  svg = d3elt.append('svg').attr('width', w).attr('height', h)
  .append('g').attr('transform', 'scale(1)');

    // define a marker for drawing arrowheads
    svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("refX", 3)
    .attr("refY", 2)
    .attr("markerWidth", 3)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0,0 V 4 L3,2 Z");

    // draw the puck
    d3agent = svg.append('circle')
    .attr('cx', 100)
    .attr('cy', 100)
    .attr('r', env.rad * this.W)
    .attr('fill', '#FF0')
    .attr('stroke', '#000')
    .attr('id', 'puck');

    // draw the target
    d3target = svg.append('circle')
    .attr('cx', 200)
    .attr('cy', 200)
    .attr('r', 10)
    .attr('fill', '#0F0')
    .attr('stroke', '#000')
    .attr('id', 'target');

    // bad target
    d3target2 = svg.append('circle')
    .attr('cx', 300)
    .attr('cy', 300)
    .attr('r', 10)
    .attr('fill', '#F00')
    .attr('stroke', '#000')
    .attr('id', 'target2');

    d3target2_radius = svg.append('circle')
    .attr('cx', 300)
    .attr('cy', 300)
    .attr('r', 10)
    .attr('fill', 'rgba(255,0,0,0.1)')
    .attr('stroke', '#000');

    // draw line indicating forces
    d3line = svg.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', 0)
    .attr('stroke', 'black')
    .attr('stroke-width', '2')
    .attr("marker-end", "url(#arrowhead)");


  }

  let updateDraw = function(a, s, r) {
    // reflect puck world state on screen
    let ppx = env.ppx; let ppy = env.ppy;
    let tx = env.tx; let ty = env.ty;
    let tx2 = env.tx2; let ty2 = env.ty2;

    d3agent.attr('cx', ppx*W).attr('cy', ppy*H);
    d3target.attr('cx', tx*W).attr('cy', ty*H);
    d3target2.attr('cx', tx2*W).attr('cy', ty2*H);
    d3target2_radius.attr('cx', tx2*W).attr('cy', ty2*H).attr('r', env.BADRAD * H);
    d3line.attr('x1', ppx*W).attr('y1', ppy*H).attr('x2', ppx*W).attr('y2', ppy*H);
    let af = 20;
    d3line.attr('visibility', a === 4 ? 'hidden' : 'visible');
    if(a === 0) {
      d3line.attr('x2', ppx*W - af);
    }
    if(a === 1) {
      d3line.attr('x2', ppx*W + af);
    }
    if(a === 2) {
      d3line.attr('y2', ppy*H - af);
    }
    if(a === 3) {
      d3line.attr('y2', ppy*H + af);
    }

    // color agent by reward
    let vv = r + 0.5;
    let ms = 255.0;
    if(vv > 0) { g = 255; r = 255 - vv*ms; b = 255 - vv*ms; }
    if(vv < 0) { g = 255 + vv*ms; r = 255; b = 255 + vv*ms; }
    let vcol = 'rgb('+Math.floor(r)+','+Math.floor(g)+','+Math.floor(b)+')';
    d3agent.attr('fill', vcol);
  }

  let PuckWorld = function() {
    this.reset();
  }
  PuckWorld.prototype = {
    reset: function() {
      this.ppx = Math.random(); // puck x,y
      this.ppy = Math.random();
      this.pvx = Math.random()*0.05 -0.025; // velocity
      this.pvy = Math.random()*0.05 -0.025;
      this.tx = Math.random(); // target
      this.ty = Math.random();
      this.tx2 = Math.random(); // target
      this.ty2 = Math.random(); // target
      this.rad = 0.05;
      this.t = 0;

      this.BADRAD = 0.25;
    },
    getNumStates: function() {
      return 8; // x,y,vx,vy, puck dx,dy
    },
    getMaxNumActions: function() {
      return 5; // left, right, up, down, nothing
    },
    getState: function() {
      let s = [this.ppx - 0.5, this.ppy - 0.5, this.pvx * 10, this.pvy * 10, this.tx-this.ppx, this.ty-this.ppy, this.tx2-this.ppx, this.ty2-this.ppy];
      return s;
    },
    sampleNextState: function(a) {

      // world dynamics
      this.ppx += this.pvx; // newton
      this.ppy += this.pvy;
      this.pvx *= 0.95; // damping
      this.pvy *= 0.95;

      // agent action influences puck velocity
      let accel = 0.002;
      if(a === 0) this.pvx -= accel;
      if(a === 1) this.pvx += accel;
      if(a === 2) this.pvy -= accel;
      if(a === 3) this.pvy += accel;

      // handle boundary conditions and bounce
      if(this.ppx < this.rad) {
        this.pvx *= -0.5; // bounce!
        this.ppx = this.rad;
      }
      if(this.ppx > 1 - this.rad) {
        this.pvx *= -0.5;
        this.ppx = 1 - this.rad;
      }
      if(this.ppy < this.rad) {
        this.pvy *= -0.5; // bounce!
        this.ppy = this.rad;
      }
      if(this.ppy > 1 - this.rad) {
        this.pvy *= -0.5;
        this.ppy = 1 - this.rad;
      }

      this.t += 1;
      if(this.t % 100 === 0) {
        this.tx = Math.random(); // reset the target location
        this.ty = Math.random();
      }

      // if(this.t % 73 === 0) {
      //   this.tx2 = Math.random(); // reset the target location
      //   this.ty2 = Math.random();
      // }

      // compute distances
      let dx = this.ppx - this.tx;
      let dy = this.ppy - this.ty;
      let d1 = Math.sqrt(dx*dx+dy*dy);

      let dx = this.ppx - this.tx2;
      let dy = this.ppy - this.ty2;
      let d2 = Math.sqrt(dx*dx+dy*dy);

      let dxnorm = dx/d2;
      let dynorm = dy/d2;
      let speed = 0.001;
      this.tx2 += speed * dxnorm;
      this.ty2 += speed * dynorm;

      // compute reward
      let r = -d1; // want to go close to green
      if(d2 < this.BADRAD) {
        // but if we're too close to red that's bad
        r += 2*(d2 - this.BADRAD)/this.BADRAD;
      }

      //if(a === 4) r += 0.05; // give bonus for gliding with no force

      // evolve state in time
      let ns = this.getState();
      let out = {'ns':ns, 'r':r};
      return out;
    }
  }

  function gofast() { steps_per_tick = 100; }
  function gonormal() { steps_per_tick = 10; }
  function goslow() { steps_per_tick = 1; }

  // flot stuff
  let nflot = 1000;
  function initFlot() {
    let container = $("#flotreward");
    let res = getFlotRewards();
    series = [{
      data: res,
      lines: {fill: true}
    }];
    let plot = $.plot(container, series, {
      grid: {
        borderWidth: 1,
        minBorderMargin: 20,
        labelMargin: 10,
        backgroundColor: {
          colors: ["#FFF", "#e4f4f4"]
        },
        margin: {
          top: 10,
          bottom: 10,
          left: 10,
        }
      },
      xaxis: {
        min: 0,
        max: nflot
      },
      yaxis: {
        min: -2,
        max: 1
      }
    });
    setInterval(function(){
      series[0].data = getFlotRewards();
      plot.setData(series);
      plot.draw();
    }, 100);
  }
  function getFlotRewards() {
    // zip rewards into flot data
    let res = [];
    for(let i=0,n=smooth_reward_history.length;i<n;i++) {
      res.push([i, smooth_reward_history[i]]);
    }
    return res;
  }

  let steps_per_tick = 1;
  let sid = -1;
  let action, state;
  let smooth_reward_history = [];
  let smooth_reward = null;
  let flott = 0;
  function togglelearn() {
    if(sid === -1) {
      sid = setInterval(function() {

        for(let k=0;k<steps_per_tick;k++) {
          state = env.getState();
          action = agent.act(state);
          let obs = env.sampleNextState(action);
          agent.learn(obs.r);
          if(smooth_reward == null) { smooth_reward = obs.r; }
          smooth_reward = smooth_reward * 0.999 + obs.r * 0.001;
          flott += 1;
          if(flott === 200) {
            // record smooth reward
            if(smooth_reward_history.length >= nflot) {
              smooth_reward_history = smooth_reward_history.slice(1);
            }
            smooth_reward_history.push(smooth_reward);
            flott = 0;
          }
        }

        updateDraw(action, state, obs.r);
        if(typeof agent.expi !== 'undefined') {
          $("#expi").html(agent.expi);
        }
        if(typeof agent.tderror !== 'undefined') {
          $("#tde").html(agent.tderror.toFixed(3));
        }
        //$("#tdest").html('tderror: ' + agent.tderror_estimator.getMean().toFixed(4) + ' +/- ' + agent.tderror_estimator.getStd().toFixed(4));

      }, 20);
    } else {
      clearInterval(sid);
      sid = -1;
    }
  }

  function saveAgent() {
    $("#mysterybox").fadeIn();
    $("#mysterybox").val(JSON.stringify(agent.toJSON()));
  }

  function loadAgent() {
    $.getJSON( "agentzoo/puckagent.json", function( data ) {
      agent.fromJSON(data); // corss your fingers...
      // set epsilon to be much lower for more optimal behavior
      agent.epsilon = 0.05;
      $("#slider").slider('value', agent.epsilon);
      $("#eps").html(agent.epsilon.toFixed(2));
      // kill learning rate to not learn
      agent.alpha = 0;
    });
  }

  function resetAgent() {
    eval($("#agentspec").val())
    agent = new RL.DQNAgent(env, spec);
  }

  let w; // global world object
  let current_interval_id;
  let skipdraw = false;
  function start() {

    env = new PuckWorld();

    initDraw();

    eval($("#agentspec").val())

    //agent = new RL.ActorCritic(env, spec);
    agent = new RL.DQNAgent(env, spec);
    //agent = new RL.RecurrentReinforceAgent(env, {});
    initFlot();

    // slider sets agent epsilon
    $("#slider").slider({
      min: 0,
      max: 1,
      value: agent.epsilon,
      step: 0.01,
      slide: function(event, ui) {
        agent.epsilon = ui.value;
        $("#eps").html(ui.value.toFixed(2));
      }
    });
    $("#eps").html(agent.epsilon.toFixed(2));

    togglelearn(); // start

    // render markdown
    $(".md").each(function(){
      $(this).html(marked($(this).html()));
    });
    renderJax();

  }

  let jaxrendered = false;
  function renderJax() {
    if(jaxrendered) { return; }
    (function () {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src  = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
      document.getElementsByTagName("head")[0].appendChild(script);
      jaxrendered = true;
    })();
  }
