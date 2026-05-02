# Wumpus-Agent-AI
Logic-Based Pathfinding Agent (Wumpus World)
Overview
This project implements a Knowledge-Based Agent for the classic Wumpus World problem using:

Propositional Logic
Conjunctive Normal Form (CNF)
Resolution Inference
Dynamic Knowledge Base
The agent explores a grid environment containing hidden hazards such as:

Pits (P)
Wumpus (W)
The agent uses logical reasoning to determine safe cells and avoid dangerous locations.

Features
Dynamic grid generation

Random placement of pits and Wumpus

Knowledge Base (KB) using logical clauses

Resolution-based inference engine

CNF representation of logical rules

Real-time visualization of:

Safe cells
Visited cells
Hazards
Agent movement
Interactive UI

Technologies Used
Technology	Purpose
HTML	Structure of the interface
CSS	Styling and visualization
JavaScript	Logic engine and game behavior
Project Structure
project/
│
├── index.html
├── style.css
├── script.js
└── README.md
How the System Works
1. Environment Initialization
The environment is generated dynamically based on the selected grid size.

One Wumpus is placed randomly.
Multiple pits are placed randomly.
The starting cell (0,0) is always safe.
Knowledge Representation
The agent uses propositional logic.

Logical Symbols
Symbol	Meaning
Pxy	Pit exists at cell (x,y)
-Pxy	No pit at cell (x,y)
Wxy	Wumpus exists at cell (x,y)
-Wxy	No Wumpus at cell (x,y)
Example:

-P12
means:

No pit exists at cell (1,2).

Conjunctive Normal Form (CNF)
The Knowledge Base stores clauses in CNF.

Example:

(A ∨ B) ∧ (¬C ∨ D)
This means:

(A OR B) AND (NOT C OR D)
In the code, clauses are stored as arrays:

['-P11', 'B12']
which represents:

¬P11 ∨ B12
Knowledge Base Operations
TELL Operation
Adds new facts/rules to the Knowledge Base.

Example:

kb.tell([`-P${x}${y}`]);
Meaning:

The current cell does not contain a pit.

ASK Operation
Queries the Knowledge Base using Resolution Inference.

Example:

kb.ask(`-W${i}${j}`)
Meaning:

Check whether cell (i,j) is safe from the Wumpus.

Resolution Inference Logic
The system uses Resolution Refutation.

To prove:

KB ⊨ Q
The algorithm:

Negates the query
Adds the negated query to the KB
Performs resolution repeatedly
Looks for contradiction
If contradiction is found:

□
then the original query is proven true.

Resolution Rule
(A ∨ B), (¬A ∨ C)
⇒ (B ∨ C)
The complementary literals are removed to generate a new clause.

Agent Reasoning
If No Breeze
If the current cell has no breeze:

¬Breeze(x,y)
⇒ ¬P(neighbor)
then all neighboring cells are safe from pits.

If No Stench
If the current cell has no stench:

¬Stench(x,y)
⇒ ¬W(neighbor)
then neighboring cells are safe from the Wumpus.

Agent Movement Strategy
The agent follows this priority:

Move to unvisited safe cells
Avoid inferred hazards
Halt if no safe moves exist
Visualization
Cell Colors
Color	Meaning
Gray	Unknown
Green	Safe
Red	Hazard
Blue	Agent position
Complexity
Resolution-based inference can become computationally expensive.

Worst-case complexity:

O(2^n)
Optimizations used:

Duplicate clause removal
Tautology detection
Iteration limits
How to Run
Step 1
Download or clone the project.

Step 2
Open:

index.html
in any modern web browser.

Future Improvements
Possible enhancements:

Full Wumpus logical encoding
Smarter search algorithms (A*, BFS)
Probabilistic reasoning
SAT solver optimization
Multiple Wumpus support
Educational Concepts Demonstrated
This project demonstrates:

Artificial Intelligence
Knowledge-Based Agents
Symbolic Reasoning
Propositional Logic
CNF Conversion
Resolution Inference
Automated Decision Making
Conclusion
This project successfully implements a logic-based AI agent capable of reasoning about an uncertain environment using CNF and Resolution.

The agent dynamically updates its knowledge and makes intelligent movement decisions without directly observing hazards.

It serves as a practical implementation of classical symbolic AI concepts and logical inference systems.
