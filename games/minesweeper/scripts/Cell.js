export class Cell {
  adjacentMines;
  isMine;
  isFlagged;
  isRevealed;
  x;
  y;

  constructor(x, y) {
    this.isMine = false;
    this.isRevealed = false;
    this.isFlagged = false;
    this.adjacentMines = 0;
    this.x = x;
    this.y = y;
  }

  insertBomb() {
    this.isMine = true;
  }

  reveal() {
    this.isRevealed = true;
    this.isFlagged = false;
  }

  changeFlagState() {
    this.isFlagged = !this.isFlagged;
  }
}
