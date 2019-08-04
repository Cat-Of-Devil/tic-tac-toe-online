(function () {

  let hash = location.hash.split('#')[1];

  let containers = document.querySelectorAll('.container');
  let container = document.querySelector('.js-game');
  let signIn = document.querySelector('.js-sign-in');
  let usernameInp = signIn.querySelector('input[type=text]');
  let usernameSave = signIn.querySelector('button');

  let username = localStorage.getItem('username');
  let gameId = localStorage.getItem('gameId');
  
  if (location.hash == '' || !username)
    location.hash = 'sign-in';

  if (gameId) {
    location.hash = `battle/${gameId}`;
  }

  window.onhashchange = function(){
    hash = location.hash.split('#')[1];
    console.log('hashchange', hash);
    showPage(hash);
  }

  function showPage(hash) {
    let chunk = hash.split('/');

    containers.forEach(function(o, i){
      if (!o.matches('.js-'+chunk[0])) {
        o.classList.add('hidden');
      } else {
        o.classList.remove('hidden');
      }
    });

    if (chunk[0] == 'sign-in') {
      if (username) location.hash = 'session-list';
    }

    if (chunk[0] == 'session-list') {
      
      fetch('/session')
      .then(resp => resp.json())
      .then((items)=>{
        let container = document.querySelector('.js-session-wrap');
        container.innerHTML = '';

        items.forEach((el, i) => {
          container.insertAdjacentHTML('beforeend', [
            '<div>',
              '<a onclick="return confirm(\'Вы уверены что хотите начать игру?\')" href="#battle/'+el.id+'">#'+el.id+': '+el.title+'</a>',
            '</a>',
          ].join(''));
        })
      })

    }

    if (chunk[0] == 'battle') {
      let gameId = chunk[1];

      if (gameId != '') {
        let stateGame = {};

        fetch('/session/'+gameId)
        .then(resp => resp.json())
        .then(session=>{
          stateGame = Object.assign({}, session);
          
          if (!localStorage.getItem('gameId')) {
            localStorage.setItem('gameId', stateGame.id);

            stateGame.playerB = username;
            stateGame.startTime = (new Date()).getTime();

            return fetch('/session/'+gameId, {
              method: 'PUT', 
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(stateGame)
            })
            .then(resp => resp.json());
          }
          
          return stateGame;
        })
        .then(session=>{
          renderGame(session);
          checkWinner();
        });

        container.addEventListener('click', function(e){
          if (e.target.matches('[data-index]:not(.disabled)')) {
            let index = +e.target.dataset.index;
            e.target.classList.add('disabled');
            
            stateGame.step++;
            stateGame.state[index] = (stateGame.step % 2 == 0) ? 0 : 1;
  
            fetch('/session/'+gameId, {
              method: 'PUT', 
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(stateGame)
            })
            .then(resp => resp.json())
            .then(session => renderGame(session));
          }
        });
      
        (function poll() {
          fetch('/session/'+gameId)
            .then(resp => resp.json())
            .then(session=>{
              renderGame(session);
              setTimeout(poll, 2000);
            });
        }());
      }
    }
  }

  function renderGame(session) {
    container.innerHTML = '';

    let stepEl = document.querySelector('.js-battle .move span');
    stepEl.innerHTML = (session.step % 2 == 0) ? 'x' : '0';

    session.state.forEach((el, i) => {
      let cssClass = (el!==null ? ((el === 1) ? 'tic' : 'tac') : '');
      cssClass += el !== null ? ' disabled' : '';

      container.insertAdjacentHTML('beforeend', [
        '<div data-index="'+i+'" data-value="'+el+'" class="col '+cssClass+'"></div>',
      ].join(''));
    });
  }


  function checkWinner() {
    let cols = container.querySelectorAll('.col');

      if
      (cols[0].matches('.tic') && cols[1].matches('.tic') && cols[2].matches('.tic') ||
          cols[3].matches('.tic') && cols[4].matches('.tic') && cols[5].matches('.tic') ||
          cols[6].matches('.tic') && cols[7].matches('.tic') && cols[8].matches('.tic') ||
          cols[0].matches('.tic') && cols[3].matches('.tic') && cols[6].matches('.tic') ||
          cols[1].matches('.tic') && cols[4].matches('.tic') && cols[7].matches('.tic') ||
          cols[2].matches('.tic') && cols[5].matches('.tic') && cols[8].matches('.tic') ||
          cols[0].matches('.tic') && cols[4].matches('.tic') && cols[8].matches('.tic') ||
          cols[2].matches('.tic') && cols[4].matches('.tic') && cols[6].matches('.tic')) {
          // winnerText.innerHTML = 'Победили крестики!';
          // winner.classList.add('active');
          alert('Победили крестики!')
      } else if
      (cols[0].matches('.tac') && cols[1].matches('.tac') && cols[2].matches('.tac') ||
          cols[3].matches('.tac') && cols[4].matches('.tac') && cols[5].matches('.tac') ||
          cols[6].matches('.tac') && cols[7].matches('.tac') && cols[8].matches('.tac') ||
          cols[0].matches('.tac') && cols[3].matches('.tac') && cols[6].matches('.tac') ||
          cols[1].matches('.tac') && cols[4].matches('.tac') && cols[7].matches('.tac') ||
          cols[2].matches('.tac') && cols[5].matches('.tac') && cols[8].matches('.tac') ||
          cols[0].matches('.tac') && cols[4].matches('.tac') && cols[8].matches('.tac') ||
          cols[2].matches('.tac') && cols[4].matches('.tac') && cols[6].matches('.tac')) {
          // winnerText.innerHTML = 'Победили нолики!';
          // winner.classList.add('active');
          alert('Победили нолики!')
      } else if (step == 9) {
          // winnerText.innerHTML = 'Ничья!';
          // winner.classList.add('active');
          alert('Ничья!')
      }
  }


  hash && showPage(hash);

  usernameSave.addEventListener('click', function(){
    username = usernameInp.value;
    if (username) {
      localStorage.setItem('username', username);
      location.hash = 'session-list';
    }
  })
  












  // let move = document.querySelector('.move span');
  // let cols = document.querySelectorAll('.col');
  // let winner = document.querySelector('.winner');
  // let winnerText = document.querySelector('.winner span');
  // let close = document.querySelector('.winner .close');

  // let step = 0;
  // cols.forEach(function (el) {
  //     el.addEventListener('click', ticTac)
  // });

  // function ticTac() {
  //     if (step % 2 == 0) {
  //         this.classList.add('tic');
  //         this.removeEventListener('click', ticTac);
  //     } else {
  //         this.classList.add('tac');
  //         this.removeEventListener('click', ticTac);
  //     }
  //     step++;
  //     move.innerHTML = (move.innerHTML == 'x') ? 'o' : 'x';
  //     checkWinner();
  // }

  // function checkWinner() {
  //     if
  //     (cols[0].matches('.tic') && cols[1].matches('.tic') && cols[2].matches('.tic') ||
  //         cols[3].matches('.tic') && cols[4].matches('.tic') && cols[5].matches('.tic') ||
  //         cols[6].matches('.tic') && cols[7].matches('.tic') && cols[8].matches('.tic') ||
  //         cols[0].matches('.tic') && cols[3].matches('.tic') && cols[6].matches('.tic') ||
  //         cols[1].matches('.tic') && cols[4].matches('.tic') && cols[7].matches('.tic') ||
  //         cols[2].matches('.tic') && cols[5].matches('.tic') && cols[8].matches('.tic') ||
  //         cols[0].matches('.tic') && cols[4].matches('.tic') && cols[8].matches('.tic') ||
  //         cols[2].matches('.tic') && cols[4].matches('.tic') && cols[6].matches('.tic')) {
  //         winnerText.innerHTML = 'Победили крестики!';
  //         winner.classList.add('active');
  //     } else if
  //     (cols[0].matches('.tac') && cols[1].matches('.tac') && cols[2].matches('.tac') ||
  //         cols[3].matches('.tac') && cols[4].matches('.tac') && cols[5].matches('.tac') ||
  //         cols[6].matches('.tac') && cols[7].matches('.tac') && cols[8].matches('.tac') ||
  //         cols[0].matches('.tac') && cols[3].matches('.tac') && cols[6].matches('.tac') ||
  //         cols[1].matches('.tac') && cols[4].matches('.tac') && cols[7].matches('.tac') ||
  //         cols[2].matches('.tac') && cols[5].matches('.tac') && cols[8].matches('.tac') ||
  //         cols[0].matches('.tac') && cols[4].matches('.tac') && cols[8].matches('.tac') ||
  //         cols[2].matches('.tac') && cols[4].matches('.tac') && cols[6].matches('.tac')) {
  //         winnerText.innerHTML = 'Победили нолики!';
  //         winner.classList.add('active');
  //     } else if (step == 9) {
  //         winnerText.innerHTML = 'Ничья!';
  //         winner.classList.add('active');
  //     }
  // }


})();