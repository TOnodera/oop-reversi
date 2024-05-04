const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const INITIAL_BOARD = [
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, DARK, LIGHT, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, LIGHT, DARK, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
];

const boardElement = document.getElementById("board");
async function showBoard() {
  const turnCount = 0;
  const response = await fetch(`/api/games/latest/turns/${turnCount}`);
  const responseBody = await response.json();
  const nextDisc = responseBody.nextDisc;

  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }

  INITIAL_BOARD.forEach((line, y) => {
    line.forEach((square, x) => {
      const squareElement = document.createElement("div");
      squareElement.className = "square";
      if (square !== EMPTY) {
        const stoneElement = document.createElement("div");
        const color = square === DARK ? "dark" : "light";
        stoneElement.className = `stone ${color}`;
        squareElement.appendChild(stoneElement);
      } else {
        squareElement.addEventListener("click", async () => {
          const nextTurnCount = turnCount + 1;
          await registerTurn(nextTurnCount, nextDisc, x, y);
        });
      }

      boardElement.appendChild(squareElement);
    });
  });
}

async function registerGame() {
  await fetch("/api/games", {
    method: "POST",
  });
}

async function registerTurn(turnCount, disc, x, y) {
  const requestBody = {
    turnCount,
    move: {
      disc,
      x,
      y,
    },
  };
  await fetch("/api/games/latest/turns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });
}

async function main() {
  await registerGame();
  await showBoard();
}
main();
