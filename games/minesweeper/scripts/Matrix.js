import { Cell } from './Cell.js';
export class Matrix {
  rows;
  columns;
  bombCount;
  matrix;
  gameOver;
  failedCell;
  gameWon;
  firstClick;
  timeCount = 0;
  intervalId;

  constructor(rows, columns, bombCount) {
    if (rows < 4) {
      throw new Error("Matice musí mít alespoň 4 řádky.");
    }
    if (columns < 4) {
      throw new Error("Matice musí mít alespoň 4 sloupce.");
    }
    this.rows = rows;
    this.columns = columns;
    this.bombCount = bombCount;
    this.generateMatrix();
    this.gameOver = false;
    this.gameWon = false;
    this.firstClick = true;
    this.timeCount = 0;

  }
  generateMatrix() {
    this.createEmptyMatrix();
    this.generateBombs();
    this.fillAdjacentMines();
  }

  createEmptyMatrix() {
    const emptyMatrix = [];
    for (let i = 0; i < this.rows; i++) {
      emptyMatrix.push([]);
      for (let j = 0; j < this.columns; j++) {
        emptyMatrix[i].push(new Cell(j, i));
      }

    }
    this.matrix = emptyMatrix;
  }

  generateBombs() {
    if (this.bombCount >= (this.rows * this.columns) / 2) {
      throw new Error("Počet může nesmí být větší než celkový počet všech políček.");
    }
    let x;
    let y;
    for (let i = 0; i < this.bombCount; i++) {
      [x, y] = this.generateRandomPosition();

      while (this.matrix[y][x].isMine) {
        [x, y] = this.generateRandomPosition();
      }
      this.matrix[y][x].insertBomb();
    }
  }


  generateRandomPosition() {
    return [Math.floor(Math.random() * this.columns), Math.floor(Math.random() * this.rows)];
  }

  doesCellExist(x, y) {
    if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) {
      return false;
    }
    return true;
  }

  countAdjacentMines(x, y) {
    let adjacentMines = 0;
    const adjacentCells = this.returnAdjacentCells(x, y);
    adjacentCells.forEach(cell => {
      if (cell.isMine) {
        adjacentMines++;
      }
    })

    return adjacentMines;
  }

  fillAdjacentMines() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.matrix[i][j].adjacentMines = this.countAdjacentMines(j, i);
      }
    }
  }
  revealCell(x, y) {
    if (this.firstClick) {
      let cell = this.matrix[y][x];
      if (cell.isMine || cell.adjacentMines > 0) {
        this.generateMatrix();
        return this.revealCell(x, y);
      }
      this.firstClick = false;
      this.intervalId = setInterval(() => {
        this.timeCount++;
      }, 1000);   
    }

    if (this.doesCellExist(x, y) && !this.matrix[y][x].isRevealed) {
      this.matrix[y][x].reveal();
      if (this.matrix[y][x].isMine) {
        this.gameOver = true;
        this.failedCell = this.matrix[y][x];
        this.stopTimer();
      } else if (this.returnUnrevealedCellCount() == this.bombCount) {
        this.gameWon = true;
        this.stopTimer();
      } else {
        if (this.matrix[y][x].adjacentMines === 0) {
          this.revealAdjacentEmptyCells(x, y);
        }
      }
    }
  }

  stopTimer() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  returnAdjacentCells(x, y) {
    let adjacentCells = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (this.doesCellExist(x + i, y + j)) {
          if (i === 0 && j === 0) continue;
          adjacentCells.push(this.matrix[y + j][x + i]);
        }
      }
    }
    return adjacentCells;
  }

  revealAdjacentEmptyCells(x, y) {
    //Vytvoříme frontu a začneme od výchozí buňky.
    let searchedCells = new Set();
    let queue = [this.matrix[y][x]];

    //Procházíme frontu – pokud buňka nebyla odhalena, odhalíme ji a označíme jako prohledanou
    while (queue.length > 0) {
      let cell = queue.shift();
      if (searchedCells.has(cell)) {
        continue;
      }
      searchedCells.add(cell);
      this.revealCell(cell.x, cell.y);

      //Pokud má buňka adjacentMines === 0, přidáme do fronty všechny její neodhalené sousedy.
      if (cell.adjacentMines === 0) {
        let adjacentCells = this.returnAdjacentCells(cell.x, cell.y);
        adjacentCells.forEach(adjacentCell => {
          if (!adjacentCell.isRevealed && !searchedCells.has(adjacentCell)) {
            queue.push(adjacentCell);
          }
        });
      }
    }
  }

  changeFlagStateOnCell(x, y) {
    if (!this.firstClick) { 
    this.matrix[y][x].changeFlagState();
  }
}

isItSafeToRevealAdjacent(x, y) {
  const adjacentCells = this.returnAdjacentCells(x, y);
  const adjacentBombCount = this.matrix[y][x].adjacentMines;
  let adjacentFlagCount = 0;
  adjacentCells.forEach(cell => {
    if (cell.isFlagged) {
      adjacentFlagCount++;
    }
  })
  return adjacentBombCount === adjacentFlagCount
}

revealAdjacent(x, y) {

  if (this.isItSafeToRevealAdjacent(x, y)) {
    const adjacentUnflaggedUnrevealedCells = this.returnAdjacentCells(x, y).filter(cell => !cell.isFlagged && !cell.isRevealed);

    adjacentUnflaggedUnrevealedCells.forEach(cell => {
      this.revealCell(cell.x, cell.y)
    })
  }
}
revealMines() {
  for (let i = 0; i < this.rows; i++) {
    for (let j = 0; j < this.columns; j++) {
      if (this.matrix[i][j].isMine) {
        this.matrix[i][j].reveal();
      }
    }
  }
}

returnUnrevealedCellCount() {
  let unrevealedCellCount = 0;
  for (let i = 0; i < this.rows; i++) {
    for (let j = 0; j < this.columns; j++) {
      if (!this.matrix[i][j].isRevealed) {
        unrevealedCellCount++;
      }
    }
  }
  return unrevealedCellCount;
}

getFlaggedCellsCount() {
  let flaggedCellsCount = 0;
  for (let i = 0; i < this.rows; i++) {
    for (let j = 0; j < this.columns; j++) {
      if (this.matrix[i][j].isFlagged && !this.matrix[i][j].isRevealed) {
        flaggedCellsCount++;
      }
    }
  }
  return flaggedCellsCount;
}


}
