import { Application, Container, Graphics, Text } from "pixi.js";

Container.prototype.setPosition = function (x, y) {
  this.x = x;
  this.y = y;
}
//Config
let possibleCharacters = ['Q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f'];
possibleCharacters = possibleCharacters.map(item => item.toUpperCase())
const canvasWidth = 1600;
const canvasHeight = 900;
const minRectWidth = 50;
const maxRectWidth = 150;
const minRectHeight = 50;
const maxRectHeight = 150;
const minFontSize = 20;
const maxFontSize = 50;
const gameOverPoints = 0;
const winPoints = 50;

function generateInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

(async () => {
  const app = new Application();

  //class that is a rectangle with a letter in center of it
  class Letter {
    constructor(speed) {
      this.character = possibleCharacters[generateInRange(0, possibleCharacters.length - 1)];
      this.width = generateInRange(minRectWidth, maxRectWidth);
      this.height = generateInRange(minRectHeight, maxRectHeight);
      this.fontSize = generateInRange(minFontSize, maxFontSize);
      this.x = generateInRange(0, canvasWidth - this.width);
      this.y = -this.height;
      this.speed = speed;
    }

    render() {
      this.rect = new Graphics().rect(0, 0, this.width, this.height).fill({ color: 0xffffff });
      this.characterPixi = new Text({
        text: this.character,
        style: {
          fontSize: this.fontSize,
          fill: 0xd05716,
          fontFamily: 'Arial'
        }
      })
      this.container = new Container();
      this.characterPixi.setPosition(this.rect.width / 2 - this.characterPixi.width / 2, this.rect.height / 2 - this.characterPixi.height / 2)
      this.container.setPosition(this.x, this.y);
      this.container.addChild(this.rect);
      this.container.addChild(this.characterPixi);
      app.stage.addChild(this.container);
    }

    destroy() {
      if (this.container) {
        this.container.destroy({ children: true, texture: true, baseTexture: true });
        app.stage.removeChild(this.container);
        this.container = null;
      }
    }
  }

  //Class that controls the game (moves objects, check if game is over, generates new Letters)
  class Controller {
    constructor() {
      this.letters = [];
      this.gameRunning = false;
      this.score = 10;
      app.ticker.add(() => {
        this.move();
        this.letters.forEach((letter) => {
          if (letter.container && letter.container.y >= canvasHeight) {
            this.gameOver('You lost! Loser! huehuehuehaw');
          };
        })
      })
    }

    gameOver(message) {
      controller.gameRunning = !controller.gameRunning;
      this.clear();
      alert(message);
      document.querySelector('.js-play').innerHTML = 'Play';
    }

    isGameOver() {
      if (this.score <= gameOverPoints) {
        this.gameOver('You lost! Loser! huehuehuehaw');
      } else if (this.score >= winPoints) {
        this.gameOver('You won! :)')
      }
    }

    changeScore(score) {
      this.score += score;
      this.isGameOver();
    }

    startGenerating() {
      this.interval = setInterval(() => {
        const newLetter = new Letter(1 + this.score * 0.05);
        this.letters.push(newLetter)
        newLetter.render();
      }, 400)
    }

    move() {
      this.letters.forEach(letter => {
        letter.container.y += 1 * letter.speed;
      });
    }

    destroy(character) {
      this.letters.forEach((letter) => {
        if (letter.character === character.toUpperCase()) {
          letter.destroy();
        }
      })
    }

    clear() {
      clearInterval(this.interval);
      app.stage.removeChildren();
      app.ticker.remove(this);
      this.letters.forEach((letter) => { letter.destroy() })
      this.letters = [];
    }
  }

  await app.init({
    width: canvasWidth,
    height: canvasHeight,
    backgroundColor: 0x177cba,
    backgroundAlpha: 0.8
  });
  const controller = new Controller();
  document.addEventListener('keydown', function (event) {
    possibleCharacters.forEach((char) => {
      if (char === event.key.toUpperCase()) {
        if (controller.gameRunning) {
          const lettersToDestroy = controller.letters.filter(letter => letter.character === char);
          const destroyedCount = lettersToDestroy.length;
          controller.letters = controller.letters.filter(letter => letter.character !== char);
          lettersToDestroy.forEach(letter => letter.destroy());
          if (destroyedCount >= 2) {
            controller.changeScore(1);
          } else {
            controller.changeScore(-2);
          }
          document.querySelector('.js-score').innerHTML = `Score: ${controller.score}`;
        }
      }
    })
  })

  document.querySelector('.js-play').addEventListener('click', () => {
    if (controller.gameRunning) {
      document.querySelector('.js-play').innerHTML = 'Play';
      controller.gameRunning = !controller.gameRunning;
      controller.clear();
    } else {
      document.querySelector('.js-play').innerHTML = 'Stop';
      controller.gameRunning = !controller.gameRunning;
      controller.score = 10;
      document.querySelector('.js-score').innerHTML = `Score: ${controller.score}`;
      controller.startGenerating();
    }
  })
  document.body.appendChild(app.canvas);
})()