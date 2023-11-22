# AB Test
This extension provides a configurable to seperate your users into two groups for A/B testing.  To accomplish this, the user is assigned to a group, either A or B which is recorded in the chat context for the user.  

# Nodes
## AB Configuration
This node provides configuration to seperate the users into one of two groups once they hit it.  This node should precede any content you are AB testing

- Slider: Set the percentage of traffic going to Group A vs Group B.

## AB Group Seperator
You can place this node anywhere you want to seperate traffic between the two groups.  Alternatively you can use an if node using the ABGroup context variable and seeing if the value is A or B.

### AB Group Seperator children
These nodes are titled Group A and Group B by default and simply give a path for path specific content.