document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.js-play-button').addEventListener('click', (e) => {
      e.preventDefault(); // ✅ This stops the form from submitting and reloading
  
      let rows = document.querySelector('.js-rows-input').value;
      let columns = document.querySelector('.js-columns-input').value;
      let mines = document.querySelector('.js-mines-input').value;
  
      if (rows >= 5 && columns >= 5 && mines >= 1) {
        window.location.href = `game.html?mines=${mines}&rows=${rows}&columns=${columns}`;
      }
    });
  });
