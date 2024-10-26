const cells = document.querySelectorAll('.cell');
const resetBtn = document.getElementById('reset-btn');
const player1Input = document.getElementById('player1-name');
const player2Input = document.getElementById('player2-name');
const switchToComputerBtn = document.getElementById('player-computer');
const resultText = document.querySelector('.result-text');
const player1Score = document.createElement('p');
const player2Score = document.createElement('p');

player1Score.style.display = "none";
player2Score.style.display = "none";
document.getElementById('player1').appendChild(player1Score);
document.getElementById('player2').appendChild(player2Score);

let isComputerOpponent = false; //Bandera para ver si la computadora es el oponente
let currentPlayer = "X";
let boardState = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];
let player1Wins = 0;
let player2Wins = 0;
const winningScore = 3;

// Función para actualizar el score
function updateScore() {
  player1Score.style.display = "block";
  player2Score.style.display = "block";
  player1Score.textContent = `${player1Input.value || "Player 1"}: ${player1Wins}`;
  player2Score.textContent = `${isComputerOpponent ? "Computer" : (player2Input.value || "Player 2")}: ${player2Wins}`;
  saveGameState(); 
}

// Función para los clics en una celda
function handleCellClick(event) {
  const cellIndex = event.target.getAttribute('data-index');
  if (boardState[cellIndex] !== "" || !gameActive || (isComputerOpponent && currentPlayer === "O")) {
    return;
  }
  updateCell(event.target, cellIndex);
  const winner = checkWinner();
  if (winner) {
    processWin(winner);
  } else if (isComputerOpponent && currentPlayer === "O" && gameActive) {
    setTimeout(computerMove, 500);
  }
}

//Función para actualizar la celda en el tablero
function updateCell(cell, index) {
  boardState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  saveGameState(); 
}

// Función para verificar ganador
function checkWinner() {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (boardState[a] &&
        boardState[a] === boardState[b] &&
        boardState[a] === boardState[c]) {
      gameActive = false;
      highlightWinningCells([a, b, c]);
      return boardState[a];
    }
  }
  if (!boardState.includes("")) {
    gameActive = false;
    return "Draw";
  }
  return null;
}

//Función para pintar celdas ganadoras
function highlightWinningCells(cells) {
  cells.forEach(index => {
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.classList.add('winning-cell');
  });
}

//Función para actualizar el marcador
function processWin(winner) {
  if (winner === "X") {
    player1Wins++;
  } else if (winner === "O") {
    player2Wins++;
  }
  updateScore();
  if (player1Wins >= winningScore) {
    const player1Name = player1Input.value || "Player 1";
    resultText.textContent = `${player1Name} wins the game!!! `;
    gameActive = false;
  } else if (player2Wins >= winningScore) {
    const player2Name = isComputerOpponent ? "Computer" : (player2Input.value || "Player 2");
    resultText.textContent = `${player2Name} wins the game!!! `;
    gameActive = false;
  }
}

// Función para determinar el movimiento de la computadora
function computerMove() {
  let availableCells = [];
  boardState.forEach((value, index) => {
    if (value === "") {
      availableCells.push(index);
    }
  });
  if (availableCells.length === 0) return;
  const randomIndex = Math.floor(Math.random() * availableCells.length);
  const chosenCellIndex = availableCells[randomIndex];
  const chosenCell = document.querySelector(`[data-index="${chosenCellIndex}"]`);
  updateCell(chosenCell, chosenCellIndex);
  const winner = checkWinner();
  if (winner) {
    processWin(winner);
  }
  saveGameState(); 
}

//Función para resetear el juego
function resetGame(fullReset = false) {
  boardState = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";
  resultText.textContent = "";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove('winning-cell');
  });
  if (fullReset) {
    player1Input.value = "";
    player2Input.value = "";
    player1Wins = 0;
    player2Wins = 0;
    player1Score.style.display = "none";
    player2Score.style.display = "none";
  }
  saveGameState();
}

//Función para el botón "Switch to computer"
function switchToComputer() {
  isComputerOpponent = !isComputerOpponent;
  player2Input.disabled = isComputerOpponent;
  switchToComputerBtn.textContent = isComputerOpponent ? "Switch to Player 2" : "Switch to Computer";
  if (!isComputerOpponent) {
    player1Score.style.display = "none";
    player2Score.style.display = "none";
    player1Wins = 0;
    player2Wins = 0;
    updateScore();
  } else {
    updateScore();
  }
  saveGameState();
}

//Función para guardar el estado del juego
function saveGameState() {
  const gameState = {
    boardState,
    currentPlayer,
    player1Wins,
    player2Wins,
    isComputerOpponent,
    player1Name: player1Input.value,
    player2Name: player2Input.value
  };
  localStorage.setItem('ticTacToeGameState', JSON.stringify(gameState));
}

//Función para cargar el estado del juego desde el local storage
function loadGameState() {
  const savedState = localStorage.getItem('ticTacToeGameState');
  if (savedState) {
    const gameState = JSON.parse(savedState);
    boardState = gameState.boardState;
    currentPlayer = gameState.currentPlayer;
    player1Wins = gameState.player1Wins;
    player2Wins = gameState.player2Wins;
    isComputerOpponent = gameState.isComputerOpponent;
    player1Input.value = gameState.player1Name || "";
    player2Input.value = gameState.player2Name || "";

    updateScore();
    renderBoard();

    if (isComputerOpponent) {
      player2Input.disabled = true;
      switchToComputerBtn.textContent = "Switch to Player 2";
    }
  }
}

//Función para actualizar interfaz del juego
function renderBoard() {
  cells.forEach((cell, index) => {
    cell.textContent = boardState[index];
    cell.classList.remove('winning-cell');
  });
}

document.addEventListener('DOMContentLoaded', loadGameState);
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', () => {
  if (player1Wins >= winningScore || player2Wins >= winningScore) {
    resetGame(true);
  } else {
    resetGame();
  }
});
switchToComputerBtn.addEventListener('click', switchToComputer);



