
(function () {

  function $(s, parent = document) {
    return parent.querySelector(s);
  }

  function $$(s, parent = document) {
    return parent.querySelectorAll(s);
  }

  let containers = $$('.container');
  let container = $('.js-game');

  let username = localStorage.getItem('username');
  let gameId = localStorage.getItem('gameId');
  
  if (location.hash == '' || !username)
    location.hash = 'sign-in';

  if (gameId) {
    location.hash = `battle/${gameId}`;
  }

  window.addEventListener('load', onHashChange);
  window.addEventListener('hashchange', onHashChange);

  function onHashChange() {
    let hash = location.hash.slice(1);
    let screen = hash.replace(/(\/?([^\/]+)\/)/);
    showScreen(hash);
  }

  function showScreen(hash) {
    let chunk = hash.split('/');

    containers.forEach(function(o, i){
      if (!o.matches('.js-'+chunk[0])) {
        o.classList.add('hidden');
      } else {
        o.classList.remove('hidden');
      }
    });

    if (chunk[0] == 'sign-in') {
      let signIn = $('.js-sign-in');
      let usernameInp = $('input[type=text]', signIn);
      let usernameSave = $('button', signIn);

      if (username) location.hash = 'sessions';

      usernameSave.addEventListener('click', function(){
        username = usernameInp.value;
        if (username) {
          localStorage.setItem('username', username);
          location.hash = 'sessions';
        }
      });
    }

    if (chunk[0] == 'sessions') {
      
      fetch(`/session?winner=no`)
      .then(resp => resp.json())
      .then((items)=>{
        let container = $('.js-session-wrap');
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

        fetch(`/session/${gameId}`)
        .then(resp => resp.json())
        .then(session=>{
          stateGame = Object.assign({}, session);
          
          if (!localStorage.getItem('gameId')) {
            localStorage.setItem('gameId', stateGame.id);

            stateGame.playerB = username;
            stateGame.startTime = (new Date()).getTime();

            return fetch(`/session/${gameId}`, {
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
        });

        container.addEventListener('click', function(e){
          if (e.target.matches('[data-index]:not(.disabled)')) {
            let index = +e.target.dataset.index;
            e.target.classList.add('disabled');
            
            stateGame.step++;
            stateGame.state[index] = getYourTool(stateGame);
  
            fetch(`/session/${gameId}`, {
              method: 'PUT', 
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(stateGame)
            })
            .then(resp => resp.json())
            .then(session => renderGame(session, true));
          }
        });
        
        (function poll() {
          fetch(`/session/${gameId}`)
            .then(resp => resp.json())
            .then(session=>{
              renderGame(session);
              if (stateGame.winner == "no") {
                setTimeout(poll, 2000);
              }
            });
        }());


        function getYourTool(session) {
          return (username == session.playerA) ? session.toolA : session.toolB;
        }
        function getYourToolTitle(session) {
          return (username == session.playerA) ? session.toolA_title : session.toolB_title;
        }
      
        function renderGame(session) {
          stateGame = Object.assign({}, session);
          container.innerHTML = '';

          let nextStep = (session.step % 2 == 0) ? session.toolA : session.toolB;
          let nextStepTitle = (session.step % 2 == 0) ? session.toolA_title : session.toolB_title;
      
          let nextStepEl = $('.js-battle .move span');
          nextStepEl.innerHTML = nextStepTitle;
      
          let titleEl = $('.js-battle .title');
          titleEl.innerHTML = `${username}, Вы играете "${getYourToolTitle(session)}"`;

          let canIStep = (getYourTool(session) == nextStep);

          session.state.forEach((el, i) => {
            let cssClass = (el!==null ? ((el === 1) ? 'tic' : 'tac') : '');
      
            cssClass += ((el !== null) || !canIStep) ? ' disabled' : '';
      
            container.insertAdjacentHTML('beforeend', [
              '<div data-index="'+i+'" data-value="'+el+'" class="col '+cssClass+'"></div>',
            ].join(''));
          });
      
          checkWinner(session);
        }
      
      
        function checkWinner(session) {
          let cols = $$('.col');
      
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
                endGame(session, 1);
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
                endGame(session, 2)
            } else if (session.step == 9) {
                // winnerText.innerHTML = 'Ничья!';
                // winner.classList.add('active');
                endGame(session, 0)
            }
        }
      
        function endGame(session, winner) {
          session.winner = winner;
          session.endTime = (new Date()).getTime();
      
          let messages = [
            'Ничья!',
            'Победили крестики!',
            'Победили нолики!',
          ];
      
          return fetch(`/session/${gameId}`, {
            method: 'PUT', 
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(session)
          })
          .then(resp => resp.json())
          .then(session => {
            alert(messages[winner]);
            gameId = null;
            localStorage.removeItem('gameId');
            location.href = '/';
          });
        }
      
      }
    }
  }

})();