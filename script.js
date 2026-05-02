
class KnowledgeBase {
    constructor() {
        this.clauses = []; // Each clause is an array of literals: ['-P11', 'B12']
        this.inferenceSteps = 0;
    }

    // Add a rule to the KB (TELL)
    tell(clause) {
        if (!this.contains(this.clauses, clause)) {
            this.clauses.push(clause);
        }
    }

    contains(arr, clause) {
        return arr.some(c => c.length === clause.length && c.every(lit => clause.includes(lit)));
    }

    ask(queryLiteral) {
        const negatedQuery = queryLiteral.startsWith('-') ? queryLiteral.slice(1) : '-' + queryLiteral;
        let workingSet = JSON.parse(JSON.stringify(this.clauses));
        workingSet.push([negatedQuery]);

        let newClauses = [];
        
        // Limits to prevent infinite loops in complex logic
        for (let step = 0; step < 50; step++) {
            for (let i = 0; i < workingSet.length; i++) {
                for (let j = i + 1; j < workingSet.length; j++) {
                    this.inferenceSteps++;
                    const resolvent = this.resolve(workingSet[i], workingSet[j]);
                    
                    if (resolvent !== null) {
                        if (resolvent.length === 0) return true; // Contradiction found!
                        if (!this.contains(workingSet, resolvent) && !this.contains(newClauses, resolvent)) {
                            newClauses.push(resolvent);
                        }
                    }
                }
            }
            if (newClauses.length === 0) break;
            workingSet = workingSet.concat(newClauses);
            newClauses = [];
        }
        return false;
    }

    resolve(c1, c2) {
        for (let lit of c1) {
            const complement = lit.startsWith('-') ? lit.slice(1) : '-' + lit;
            if (c2.includes(complement)) {
                // Combine clauses and remove the complementary pair
                const result = [...new Set([...c1, ...c2])].filter(l => l !== lit && l !== complement);
                // Check if result is a tautology (contains both P and -P), discard if so
                if (this.isTautology(result)) continue;
                return result;
            }
        }
        return null;
    }

    isTautology(clause) {
        return clause.some(lit => {
            const complement = lit.startsWith('-') ? lit.slice(1) : '-' + lit;
            return clause.includes(complement);
        });
    }
}

/**
 * AGENT & ENVIRONMENT MANAGEMENT
 */
let size, grid, agentPos, kb, visited, gameOver;

function initGame() {
    size = parseInt(document.getElementById('gridSize').value);
    grid = Array(size).fill().map(() => Array(size).fill(null));
    visited = Array(size).fill().map(() => Array(size).fill(false));
    kb = new KnowledgeBase();
    agentPos = { x: 0, y: 0 };
    gameOver = false;
    
    // Random Placement: Wumpus and Pits
    placeElement('W'); 
    const pitCount = Math.max(1, Math.floor((size * size) * 0.15));
    for(let i=0; i < pitCount; i++) placeElement('P');

    document.getElementById('inferenceCount').innerText = '0';
    document.getElementById('statusDisplay').innerText = "Agent at Start (0,0)";
    document.getElementById('perceptsDisplay').innerText = "None";
    
    render();
}

function placeElement(type) {
    let x, y;
    do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
    } while ((x === 0 && y === 0) || grid[y][x] !== null);
    grid[y][x] = type;
}

function getPercepts(x, y) {
    let p = [];
    const neighbors = getNeighbors(x, y);
    neighbors.forEach(n => {
        if (grid[n.y][n.x] === 'P') p.push('Breeze');
        if (grid[n.y][n.x] === 'W') p.push('Stench');
    });
    return [...new Set(p)];
}

function getNeighbors(x, y) {
    return [[0,1],[0,-1],[1,0],[-1,0]]
        .map(([dx, dy]) => ({ x: x + dx, y: y + dy }))
        .filter(n => n.x >= 0 && n.x < size && n.y >= 0 && n.y < size);
}

function nextStep() {
    if (gameOver) return;

    const { x, y } = agentPos;
    visited[y][x] = true;
    const percepts = getPercepts(x, y);
    document.getElementById('perceptsDisplay').innerText = percepts.join(', ') || 'None';

    // TELL KB facts about current cell
    kb.tell([`-P${x}${y}`]);
    kb.tell([`-W${x}${y}`]);

    const neighbors = getNeighbors(x, y);

    // Rule: If no Breeze, all neighbors are safe from Pits
    if (!percepts.includes('Breeze')) {
        neighbors.forEach(n => kb.tell([`-P${n.x}${n.y}`]));
    }
    // Rule: If no Stench, all neighbors are safe from Wumpus
    if (!percepts.includes('Stench')) {
        neighbors.forEach(n => kb.tell([`-W${n.x}${n.y}`]));
    }

    // Logic to find the next move
    let moved = false;
    
    // Priority 1: Unvisited safe cells
    for (let j = 0; j < size; j++) {
        for (let i = 0; i < size; i++) {
            if (!visited[j][i]) {
                const safePit = kb.ask(`-P${i}${j}`);
                const safeWumpus = kb.ask(`-W${i}${j}`);
                
                if (safePit && safeWumpus) {
                    agentPos = { x: i, y: j };
                    moved = true;
                    break;
                }
            }
        }
        if (moved) break;
    }

    if (!moved) {
        document.getElementById('statusDisplay').innerText = "No safe moves left. Halted.";
        gameOver = true;
    } else {
        document.getElementById('statusDisplay').innerText = `Moving to (${agentPos.x}, ${agentPos.y})`;
        if (grid[agentPos.y][agentPos.x]) {
            gameOver = true;
            document.getElementById('statusDisplay').innerText = `DIED: Hit a ${grid[agentPos.y][agentPos.x]} at (${agentPos.x}, ${agentPos.y})`;
        }
    }

    document.getElementById('inferenceCount').innerText = kb.inferenceSteps;
    render();
}

function render() {
    const container = document.getElementById('grid');
    container.style.gridTemplateColumns = `repeat(${size}, 70px)`;
    container.innerHTML = '';

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // Resolution check for coloring (visualize KB state)
            const isSafe = kb.ask(`-P${x}${y}`) && kb.ask(`-W${x}${y}`);
            const isPit = kb.ask(`P${x}${y}`);
            const isWumpus = kb.ask(`W${x}${y}`);

            if (isSafe) cell.classList.add('safe');
            if (visited[y][x]) cell.classList.add('visited');
            if (isPit) { cell.classList.add('hazard'); cell.innerText = 'PIT'; }
            if (isWumpus) { cell.classList.add('hazard'); cell.innerText = 'WUMPUS'; }
            if (agentPos.x === x && agentPos.y === y) cell.classList.add('agent');

            container.appendChild(cell);
        }
    }
}

// Initial Run
initGame();