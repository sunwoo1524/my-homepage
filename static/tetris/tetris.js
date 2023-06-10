const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const next = document.getElementById("next");
const nextContext = next.getContext("2d");
const start = document.getElementById("start");
const scoreView = document.getElementById("score");
const levelView = document.getElementById("level");

const row = 10;
const col = 20;

const shapes = [
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],  // I
    [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],  // J
    [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],  // L
    [
        [4, 4],
        [4, 4]
    ],  // O
    [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],  // S
    [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],  // T
    [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]   // Z
];

const colors = [
    "#20aeb3",
    "#1379ed",
    "#de933e",
    "#dec93e",
    "#3b9e2e",
    "#7d30b8",
    "#d14d4d"
];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

context.scale(30, 30);
nextContext.scale(30, 30);

class Tetris {
    constructor(shape) {
        this.x = 3;
        this.y = -1;
        this.shape = JSON.parse(JSON.stringify(shape));
    }

    draw() {
        this.shape.forEach((line, dy) => {
            line.forEach((id, dx) => {
                if (id > 0) {
                    drawBlock(context, dx + this.x, dy + this.y, id - 1);
                }
            });
        });
        
        drawBoard();
    }

    rotate(shape) {
        shape.reverse();
        
        for (let i = 0; i < shape.length; i++) {
            for (let j = i; j < shape.length; j++) {
                let temp = shape[i][j];

                shape[i][j] = shape[j][i];
                shape[j][i] = temp;
            }
        }

        return shape;
    }

    canRotate() {
        let value = true;
        let shape = JSON.parse(JSON.stringify(this.shape));

        this.rotate(shape).forEach((line, dy) => {
            line.forEach((id, dx) => {
                if (id > 0) {
                    if (dx + this.x === -1 || dx + this.x === row || dy + this.y === col) {
                        value = false;
                    } else if (grid[this.y >= 0 ? dy + this.y : 0][dx + this.x] > 0) {
                        value = false;
                    }
                }
            });
        });

        return value;
    }

    canDrop() {
        let value = true;

        this.shape.forEach((line, dy) => {
            line.forEach((id, dx) => {
                if (id > 0) {
                    if (dy + this.y + 1 === col) {
                        value = false;
                    } else if (grid[dy + this.y + 1][dx + this.x] > 0) {
                        value = false;
                    }
                }
            });
        });

        return value;
    }

    canMove(dir) {
        let value = true;

        this.shape.forEach((line, dy) => {
            line.forEach((id, dx) => {
                if (id > 0) {
                    if (dir === "left") {
                        if (dx + this.x - 1 === -1) {
                            value = false;
                        } else if (grid[this.y >= 0 ? dy + this.y : 0][dx + this.x - 1] > 0) {
                            value = false;
                        }
                    } else if (dir === "right") {
                        if (dx + this.x + 1 === row) {
                            value = false;
                        } else if (grid[this.y >= 0 ? dy + this.y : 0][dx + this.x + 1] > 0) {
                            value = false;
                        }
                    }
                }
            });
        });

        return value;
    }

    dropped() {
        clearInterval(dropInterval);

        if (this.y === -1) {
            gameOver();
        }

        if (running) {
            let fuckingErrorArray = JSON.parse(JSON.stringify(grid));
            // 이렇게 grid 변수를 복제해서 지정한 다음 grid를 복제한 변수로 지정해야 오류가 나지 않습니다... 망할놈의자바스크립트

            this.shape.forEach((line, dy) => {
                line.forEach((id, dx) => {
                    if (id > 0) {
                        fuckingErrorArray[dy + this.y][dx + this.x] = id;
                    }
                });
            });
            
            grid = fuckingErrorArray;

            clearLine();
            createNewTetris();
        }
    }
}

let tetris = new Tetris(shapes[random(0, 6)]);
let nextTetris = random(0, 6);
let grid = Array(col).fill(Array(row).fill(0));
let running = false;
let dropInterval = 0;
let score = 0;
let calcScore = 0;
let level = 1;
let speed = 1;

function showGame() {
    context.clearRect(0, 0, row, col);
    drawBoard();
    drawGrid();
    tetris.draw();
    requestAnimationFrame(showGame);
}

function drawBoard() {
    grid.forEach((line, y) => {
        line.forEach((id, x) => {
            if (id > 0) {
                drawBlock(context, x, y, id - 1);
            }
        });
    });
}

function drawGrid() {
    context.lineWidth = 0.15;
    context.strokeStyle = "#c2c2c2";
    for (let i = 0; i < col; i++) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(row, i);
        context.stroke();
    }
    
    for (let i = 0; i < row; i++) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, col);
        context.stroke();
    }
}

function drawNext() {
    nextContext.clearRect(0, 0, next.width, next.height);
    shapes[nextTetris].forEach((row, dy) => {
        row.forEach((id, dx) => {
            if (id > 0) drawBlock(nextContext, dx, dy, id - 1);
        });
    });
}

function clearLine() {
    let clear = [];
    let clearTime = 0;

    grid.forEach((value, y) => {
        let line = true;

        value.forEach((id) => {
            if (id === 0) {
                line = false;
            }
        });

        if (line) {
            clear.push(y);
        }
    });

    clear.forEach((value) => {
        grid.splice(value, 1);
        grid.unshift(Array(row).fill(0));
        clearTime++;
    });

    switch (clearTime) {
        case 1:
            score += 1;
            calcScore += 1;
            break;
        case 2:
            score += 3;
            calcScore += 3;
            break;
        case 3:
            score += 5;
            calcScore += 5;
            break;
        case 4:
            score += 10;
            calcScore += 10;
            break;
    }

    scoreView.innerText = score;

    if (calcScore >= 10) {
        level += 1;
        levelView.innerText = level;
        calcScore = Number(String(score).at(1));
        speed += 0.5;
    }
}

function drawBlock(ctx, x, y, id) {
    ctx.fillStyle = colors[id];
    ctx.fillRect(x, y, 1, 1);
}

function dropBlock() {
    if (tetris.canDrop()) {
        tetris.y += 1;
    } else {
        tetris.dropped();
    }
}

function hardDrop() {
    while (tetris.canDrop()) {
        tetris.y += 1;
    }

    tetris.dropped();
}

function moveBlock(dir) {
    if (tetris.canMove(dir)) {
        if (dir === "left") {
            tetris.x -= 1;
        } else if (dir === "right") {
            tetris.x += 1;
        }
    }
}

function createNewTetris() {
    tetris = new Tetris(shapes[nextTetris]);
    nextTetris = random(0, 6);
    drawNext();
    dropInterval = setInterval(dropBlock, 1000 / speed);
}

function gameOver() {
    running = false;

    alert("Game over!");
}

function startGame() {
    running = true;
    showGame();
    dropInterval = setInterval(dropBlock, 1000 / speed);
}

function reset() {
    clearInterval(dropInterval);
    context.clearRect(0, 0, canvas.width, canvas.height);
    grid = Array(col).fill(Array(row).fill(0));
}

start.onclick = () => {
    startGame();
    drawNext();
    start.style.display = "none";
}

document.onkeydown = (event) => {
    if (running) {
        switch (event.key) {
            case "ArrowUp":
                if (tetris.canRotate()) {
                    tetris.shape = tetris.rotate(tetris.shape);
                }
                break;
            case "ArrowDown":
                dropBlock();
                break;
            case "ArrowLeft":
                moveBlock("left");
                break;
            case "ArrowRight":
                moveBlock("right");
                break;
            case " ":
                hardDrop();
                break;
        }
    }
}