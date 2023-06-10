const playInput = document.querySelector("#play");
const speedInput = document.querySelector("#speed");
const speedSpan = document.querySelector("#speed-value");

const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");
const pixel_size = 12;

let pixel_width;
let pixel_height;

let cursorX, cursorY;

let grid;
let draw = false;
let fill = false;
let speed = 1;

let interval;

function init() {
    const screenw = window.innerWidth;
    const screenh = window.innerHeight;
    
    let canvasw = (screenw / 100 * 95);
    canvasw -= canvasw % pixel_size;

    let canvash = (screenh / 100 * 80);
    canvash -= canvash % pixel_size;

    canvas.width = canvasw;
    canvas.height = canvash;

    pixel_width = canvasw / pixel_size;
    pixel_height = canvash / pixel_size;

    grid = Array(pixel_height).fill(Array(pixel_width).fill(0))
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    grid.forEach((r, y) => {
        r.forEach((e, x) => {
            if (grid[y][x] == 1) {
                context.fillStyle = "black";
                context.fillRect(x * pixel_size, y * pixel_size, pixel_size, pixel_size);
            }
        });
    });

    context.strokeStyle = "gray";
    context.strokeRect(cursorX, cursorY, pixel_size, pixel_size);

    requestAnimationFrame(drawBoard);
}

function drawCell(x, y) {
    let temp = JSON.parse(JSON.stringify(grid));

    if (draw && x < canvas.width && y < canvas.height) {
        if (fill) {
            temp[y / pixel_size][x / pixel_size] = 1;
        } else {
            temp[y / pixel_size][x / pixel_size] = 0;
        }
    }

    grid = temp;
}

function calculate() {
    let temp = JSON.parse(JSON.stringify(grid));

    grid.forEach((r, y) => {
        r.forEach((e, x) => {
            let cell = grid[y][x];
            let around = 0;

            for (let i = y - 1; i <= y + 1; i++) {
                for (let j = x - 1; j <= x + 1; j++) {
                    if (i >= 0 && i < pixel_height && j >= 0 && j < pixel_width) {
                        if (grid[i][j] == 1) {
                            around++;
                        }
                    }
                }
            }

            if (cell == 1) {
                around--;
            }

            if (around == 3) {
                temp[y][x] = 1;
            } else if (around != 2) {
                temp[y][x] = 0;
            }
        });
    });

    grid = temp;
}

window.onload = () => {
    init();
    drawBoard();
}

playInput.addEventListener("change", event => {
    if (event.target.checked) {
        interval = setInterval(calculate, 1000 / speed);
    } else {
        clearInterval(interval);
    }
});

speedInput.addEventListener("change", event => {
    speed = Number(event.target.value);
    speedSpan.innerText = speed;
    if (playInput.checked) {
        clearInterval(interval);
        interval = setInterval(calculate, 1000 / speed);
    }
});

canvas.addEventListener("mousemove", event => {
    let [x, y] = [event.offsetX - (event.offsetX % pixel_size), event.offsetY - (event.offsetY % pixel_size)];
    [cursorX, cursorY] = [x, y];

    drawCell(x, y);
})

canvas.addEventListener("mousedown", event => {
    let [x, y] = [event.offsetX - (event.offsetX % pixel_size), event.offsetY - (event.offsetY % pixel_size)];

    if (grid[y / pixel_size][x / pixel_size] == 0) {
        fill = true;
    } else {
        fill = false;
    }

    draw = true;

    drawCell(x, y);
});

canvas.addEventListener("mouseup", event => {
    draw = false;
});
