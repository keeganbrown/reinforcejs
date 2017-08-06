
    ### Setup

    This is a toy environment called **Gridworld** that is often used as a toy model in the Reinforcement Learning literature. In this particular case:

    - **State space**: GridWorld has 10x10 = 100 distinct states. The start state is the top left cell. The gray cells are walls and cannot be moved to.
    - **Actions**: The agent can choose from up to 4 actions to move around. In this example
    - **Environment Dynamics**: GridWorld is deterministic, leading to the same new state given each state and action
    - **Rewards**: The agent receives +1 reward when it is in the center square (the one that shows R 1.0), and -1 reward in a few states (R -1.0 is shown for these). The state with +1.0 reward is the goal state and resets the agent back to start.

    In other words, this is a deterministic, finite Markov Decision Process (MDP) and as always the goal is to find an agent policy (shown here by arrows) that maximizes the future discounted reward. My favorite part is letting Value iteration converge, then change the cell rewards and watch the policy adjust.

    **Interface**. The color of the cells (initially all white) shows the current estimate of the Value (discounted reward) of that state, with the current policy. Note that you can select any cell and change its reward with the *Cell reward* slider.

    ### Dynamic Programming

    An interested reader should refer to **Richard Sutton's Free Online Book on Reinforcement Learning**, in this particular case [Chapter 4](http://webdocs.cs.ualberta.ca/~sutton/book/ebook/node40.html). Briefly, an agent interacts with the environment based on its policy \\(\pi(a \mid s)\\). This is a function from states \\(s\\) to an action \\(a\\), or more generally to a distribution over the possible actions. After every action, the agent also receives a reward \\(r\\) from the environment. The interaction between the agent and the environment hence takes the form \\(s\_t, a\_t, r\_t, s\_{t+1}, a\_{t+1}, r\_{t+1}, s\_{t+2}, \ldots \\), indexed by t (time) and our goal is to find the policy \\(\pi^\*\\) that maximizes the amount of reward over time. In the DP approach, it is helpful to define a **Value function** \\(V^\pi(s)\\) that gives the expected reward when starting from the state \\(s\\) and then interacting with the environment according to \\(\pi\\):

    $$
    V^\pi(s) = E \\{ r\_t + \gamma r\_{t+1} + \gamma^2 r\_{t+2} + \ldots \mid s\_t = s \\}
    $$

    Note that the expectation is over both 1. the agent's (in general) stochastic policy and 2. the environment dynamics; That is, how the environment evolves when the agent takes an action \\(a\\) in state \\(s\\) and what the obtained reward is in that case. The constant \\(\gamma\\) is a discount factor that gives more weight to earlier rewards than the later ones. We can start writing out the expectation. To get the value of state \\(s\\) we sum over all the actions the agent would take, then over all ways the environment could respond, and so on back and forth. When you do this, you'll find that:

    $$
    V^\pi(s) = \sum\_{a} \pi(s,a) \sum\_{s'} \mathcal{P}\_{ss'}^{a} \left[ \mathcal{R}\_{ss'}^{a} + \gamma V^\pi(s') \right]
    $$

    In the above equation \\(\mathcal{P}\_{ss'}^{a} , \mathcal{R}\_{ss'}^{a} \\) are fixed constants specific to the environment, and give the probability of the next state \\(s'\\) given that the agent took action \\(a\\) in state \\(s\\), and the expected reward for that transition, respectively. This equation is called the **Bellman Equation** and interestingly, it describes a recursive relationship that the value function for a given policy should satisfy.

    With our goal of finding the optimal policy \\(\pi^\*(s,a)\\) that gets the most Value from all states, our strategy will be to follow the **Policy Iteration** scheme: We start out with some diffuse initial policy and evaluate the Value function of every state under that policy by turning the Bellman equation into an update. The value function effectively diffuses the rewards backwards through the environment dynamics and the agent's expected actions, as given by its current policy. Once we estimate the values of all states we will update the policy to be greedy with respect the Value function. We then re-estimate the Value of each state, and continue iterating until we converge to the optimal policy (the process can be shown to converge). These two steps can be controlled by the buttons in the interface:

    - The **Policy Evaluation (one sweep)** button turns the Bellman equation into a synchronous update and performs a single step of Value Function estimation. Intuitively, this update is diffusing the raw Rewards at each state to other nearby states through 1. the the dynamics of the environment and 2. the current policy.
    - The **Policy Update** button iterates over all states and updates the policy at each state to take the action that leads to the state with the best Value (integrating over the next state distribution of the environment for each action).
    - The **Value Iteration** button starts a timer that presses the two buttons in turns. In particular, note that Value Iteration doesn't wait for the Value function to be fully estimates, but only a single synchronous sweep of Bellman update is carried out. In full policy iteration there would be many sweeps (until convergence) of backups before the policy is updated.

    ### Sketch of the Code
    The goal of **Policy Evaluation** is to update the value of every state by diffusing the rewards backwards through the dynamics of the world and current policy (this is called a *backup*). The code looks like this:

    <pre><code class="js">
      evaluatePolicy: function() {
      // perform a synchronous update of the value function
      var Vnew = zeros(this.ns); // initialize new value function array for each state
      for(var s=0;s < this.ns;s++) {
      var v = 0.0;
      var poss = this.env.allowedActions(s); // fetch all possible actions
      for(var i=0,n=poss.length;i < n;i++) {
      var a = poss[i];
      var prob = this.P[a*this.ns+s]; // probability of taking action under current policy
      var ns = this.env.nextStateDistribution(s,a); // look up the next state
      var rs = this.env.reward(s,a,ns); // get reward for s->a->ns transition
      v += prob * (rs + this.gamma * this.V[ns]);
    }
    Vnew[s] = v;
  }
  this.V = Vnew; // swap
},
</code></pre>

Here, we see `this.ns` (number of states), `this.P` which stores the current policy, and `this.env`, which is a pointer to the Environment object. The policy array is one-dimensional in this implementation, but stores the probability of taking any action in any state, so I'm using funny indexing (`this.P[a*this.ns+s]`) to not have to deal with 2D arrays in Javascript. The code implements the synchronous Value backup for each state:

\begin{align}
V^\pi(s) & = E\_\pi \\{ r\_t + \\gamma r\_{t+1} + \\gamma^2 r\_{t+2} + \\ldots \\mid s\_t = s  \\} \\\\
& = E\_\pi \\{ r\_t + \\gamma V^\pi(s\_{t+1}) \\mid s\_t = s  \\} \\\\
& = \sum\_a \pi(s,a) \sum\_{s'} \mathcal{P}\_{ss'}^a \left[ \mathcal{R}\_{ss'}^a + \\gamma V(s') \right]
\end{align}

However, note that in the code we only took expectation over the policy actions (the first sum above), while the second sum above was not evaluated because this Gridworld is deterministic (i.e. `ns` in the code is just a single integer indicating the next state). Hence, the entire probability mass is on a single next state and no expectation is needed.

Once the Value function was re-estimated, we can perform a **Policy Update**, making the policy greedy with respect to the estimate Value in each state. This is a very simple process, but the code below is a little bloated because we're handling ties between actions carefully and distributing the policy probabilities equally over all winning actions:

<pre><code class="js">
  updatePolicy: function() {
  // update policy to be greedy w.r.t. learned Value function
  // iterate over all states...
  for(var s=0;s < this.ns;s++) {
  var poss = this.env.allowedActions(s);
  // compute value of taking each allowed action
  var vmax, nmax;
  var vs = [];
  for(var i=0,n=poss.length;i < n;i++) {
  var a = poss[i];
  // compute the value of taking action a
  var ns = this.env.nextStateDistribution(s,a);
  var rs = this.env.reward(s,a,ns);
  var v = rs + this.gamma * this.V[ns];
  // bookeeping: store it and maintain max
  vs.push(v);
  if(i === 0 || v > vmax) { vmax = v; nmax = 1; }
  else if(v === vmax) { nmax += 1; }
}
// update policy smoothly across all argmaxy actions
for(var i=0,n=poss.length;i < n;i++) {
var a = poss[i];
this.P[a*this.ns+s] = (vs[i] === vmax) ? 1.0/nmax : 0.0;
}
}
},
</code></pre>

Here, we are computing the action value function at each state \\(Q(s,a)\\), which measures how much expected reward we would get by taking the action \\(a\\) in the state \\(s\\). The function has the form:

\begin{align}
Q^\pi (s,a) &= E\_\pi \\{ r\_t + \\gamma V^\pi(s\_{t+1}) \\mid s\_t = s, a\_t = a \\} \\\\
&= \sum\_{s'} \mathcal{P}\_{ss'}^a \left[ \mathcal{R}\_{ss'}^a + \\gamma V^\pi(s') \right]
\end{align}

In our Gridworld example, we are looping over all states and evaluating the Q function for each of the (up to) four possible actions. Then we update the policy to take the argmaxy actions at each state. That is,

$$
\pi'(s) = \arg\max_a Q(s,a)
$$

It can be shown (see Richard Sutton's book) that performing these updates over and over again is guaranteed to converge to the optimal policy. In this Gridworld example, this corresponds to arrows that perfectly guide the agent to the terminal state where it gets reward +1.

### REINFORCEjs API use of DP

If you'd like to use the REINFORCEjs Dynamic Programming for your MDP, you have to define an environment object `env` that has a few methods that the DP agent will need:

- `env.getNumStates()` returns an integer of total number of states
- `env.getMaxNumActions()` returns an integer with max number of actions in any state
- `env.allowedActions(s)` takes an integer `s` and returns a list of available actions, which should be integers from zero to `maxNumActions`
- `env.nextStateDistribution(s,a)`, which is a misnomer, since right now the library assumes deterministic MDPs that have a single unique new state for every (state, action) pair. Therefore, the function should return a single integer that identifies the next state of the world
- `env.reward(s,a,ns)`, which returns a float for the reward achieved by the agent for the `s`, `a`, `ns` transition. In the simplest case, the reward is usually based only the state `s`.

See the GridWorld environment in this demo's source code for an example. An example of creating and training the agent will then look something like:

<pre><code class="js">
  // create environment
  env = new Gridworld();
  // create the agent, yay! Discount factor 0.9
  agent = new RL.DPAgent(env, {'gamma':0.9});

  // call this function repeatedly until convergence:
  agent.learn();

  // once trained, get the agent's behavior with:
  var action = agent.act(); // returns the index of the chosen action
</code></pre>

### Pros and Cons

In practice you'll rarely see people use Dynamic Programming to solve Reinforcement Learning problems. There are numerous reasons for this, but the two biggest ones are probably that:

- It's not obvious how one can extend this to continuous actions and states
- To calculate these updates one must have access to the environment model \\(P\_{ss'}^a\\), which is in practice almost never available. The best we can usually hope for is to get samples from this distribution by having an agent interacting with the environment and collecting experience, which we can use to approximately evaluate the expectations by sampling. More on this in TD methods!

However, the nice parts are that:

- Everything is mathematically exact, expressible and analyzable.
- If your problem is relatively small (maybe a few thousand states and up to few tens/hundreds actions), DP methods might be the best solution for you because they are the most stable, safest and come with simplest convergence guarantees.
