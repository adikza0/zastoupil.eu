import { Matrix } from './Matrix.js';

let timerInterval;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let rows = urlParams.get('columns');
let columns = urlParams.get('rows');
let mines = urlParams.get('mines');


if (columns < 5 || columns === null) {
  columns = 10;
}
if (rows < 5 || rows === null) {
  rows = 10;
}
if (mines === null) {
  mines = 8;
}

const matrix = new Matrix(columns, rows, mines);
handleGameStatus(matrix)


export function updateRemainingFlags(matrix) {
  const remainingFlags = matrix.bombCount - matrix.getFlaggedCellsCount();
  document.querySelector('.js-score').innerHTML = `🚩${remainingFlags}`;

}

export function generateHTML(matrix) {

  let gameHTML = '';
  for (let i = 0; i < matrix.rows; i++) {
    gameHTML += '<div class="row">';
    for (let j = 0; j < matrix.columns; j++) {
      let content = '';
      if (matrix.matrix[i][j].isRevealed) {
        if (matrix.matrix[i][j].isMine) {
          content = '💣';
        } else {
          if (matrix.matrix[i][j].adjacentMines === 0) {
            content = ''
          } else {
            content = matrix.matrix[i][j].adjacentMines;
          }
        }
      } else {
        if (matrix.matrix[i][j].isFlagged) {
          content = '🚩';
        } else {
          content = '';
        }
      }
      gameHTML += `<div class="cell${matrix.matrix[i][j].isRevealed ? ' revealed' : ''}${matrix.failedCell && i === matrix.failedCell.y && j === matrix.failedCell.x ? ' failed' : ''}" data-x="${j}" data-y="${i}">${content}</div>`;
    }
    gameHTML += '</div>';
  }
  document.querySelector('.js-game-container').innerHTML = gameHTML;
  if (!matrix.gameOver) {
    updateRemainingFlags(matrix);
  }
};

export function handleGameStatus(matrix) {
  clearInterval(timerInterval);
  timerInterval = null;
  if (matrix.gameOver) {
    matrix.revealMines();
    generateHTML(matrix);
    showAlert('YOU LOST!');
  } else if (matrix.gameWon) {
    generateHTML(matrix);
    showAlert('YOU WON!');
  } else {
    generateHTML(matrix);
    addEventListeners(matrix);
  }

  timerInterval = setInterval(() => {
    if (!matrix.gameOver && !matrix.gameWon) {
      document.querySelector('.js-timer').innerHTML = `⏱️${matrix.timeCount}`;
    }
  }, 100)

}

function showAlert(message) {
  setTimeout(() => {
    alert(message);
  }, 1);
}




function addEventListeners(matrix) {
  document.querySelector('.js-reset').addEventListener('click', () => {
    location.reload();
  })
  document.addEventListener('contextmenu', event => {
    event.preventDefault();
  })
  document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', cell => {
      const x = parseInt(cell.target.dataset.x);
      const y = parseInt(cell.target.dataset.y);
      const isRMBPressed = cell.buttons === 2 || cell.buttons === 3; // Right mouse button pressed
      if (!matrix.matrix[y][x].isRevealed && !isRMBPressed) {
        matrix.revealCell(x, y);
        handleGameStatus(matrix)
      } else {
        if (matrix.matrix[y][x].adjacentMines !== 0 && isRMBPressed) {
          matrix.revealAdjacent(x, y);
          handleGameStatus(matrix)
        }
      }
    })


    cell.addEventListener('contextmenu', cell => {
      const x = parseInt(cell.target.dataset.x);
      const y = parseInt(cell.target.dataset.y);
      if (!matrix.matrix[y][x].isRevealed) {
        matrix.changeFlagStateOnCell(x, y);
        handleGameStatus(matrix)
      }
    })
  })
}

