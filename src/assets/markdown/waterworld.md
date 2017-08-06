
    ### Setup

    This is another Deep Q Learning demo with a more realistic and larger setup:

    - The **state space** is even larger and continuous: The agent has 30 eye sensors pointing in all directions and in each direction is observes 5 variables: the range, the type of sensed object (green, red), and the velocity of the sensed object. The agent's proprioception includes two additional sensors for its own speed in both x and y directions. This is a total of 152-dimensional state space.
    - There are 4 **actions** available to the agent: To apply thrusters to the left, right, up and down. This gives the agent control over its velocity.
    - The **dynamics** integrate the velocity of the agent to change its position. The green and red targets bounce around.
    - The **reward** awarded to the agent is +1 for making contact with any red target (these are apples) and -1 for making contact with any green target (this is poison).

    The optimal strategy of the agent is to cruise around, run away from green targets and eat red targets. What's interesting about this demo is that the state space is so high-dimensional, and also that the sensed variables are agent-relative. They're not just toy x,y coordinates of some fixed number of targets as in previous demo.
