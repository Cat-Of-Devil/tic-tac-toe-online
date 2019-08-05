
(function () {

  function $(s, parent = document) {
    return parent.querySelector(s);
  }

  function $$(s, parent = document) {
    return parent.querySelectorAll(s);
  }

  let containers = $$('.container');
  let username = localStorage.getItem('username');
  let gameId = localStorage.getItem('gameId');
  let gameState = {};
  
  if (location.hash == '' || !username)
    location.hash = 'sign-in';

  if (gameId) {
    location.hash = `battle/${gameId}`;
  }

  window.addEventListener('load', onHashChange);
  window.addEventListener('hashchange', onHashChange);

  function onHashChange() {
    let hash = location.hash.slice(1);
    let screen = hash.replace(/(\/?([^\/]+)\/?.*)/, "$2");
    console.log('screen: ', screen);

    switch(screen) {
      case "sign-in":  doSignIn(); break;
      case "sessions": doSessions(); break;
      case "battle":   doBattle(); break;
      case "rating":   doRating(); break;
      default: {
        location.hash = "sign-in";
      }
    }
  }

  function hideAllScreen(){
    containers.forEach(function(o, i){
      o.classList.add('hidden');
    });
  }

  function showScreen(el){
    hideAllScreen();
    el.classList.remove('hidden');
  }

  function doSignIn(){
    let container = $('.js-sign-in');
    let usernameInp = $('input[type=text]', container);
    let saveBtn = $('button', container);
    
    showScreen(container);
    
    saveBtn.addEventListener('click', function(){
      username = usernameInp.value;
      if (username) {
        localStorage.setItem('username', username);
        location.hash = 'sessions';
      }
    });
  }

  function doSessions(){
    let container = $('.js-sessions');
    let wrapper = $('.js-session-list', container);

    showScreen(container);
    
    fetch(`/session?winner=no`)
    .then(resp => resp.json())
    .then((items)=>{
      wrapper.innerHTML = '';

      items.forEach((el, i) => {
        wrapper.insertAdjacentHTML('beforeend', [
          '<div>',
            '<a onclick="return confirm(\'Вы уверены что хотите начать игру?\')" href="#battle/'+el.id+'">#'+el.id+': '+el.title+'</a>',
          '</a>',
        ].join(''));
      })
    });
  }

  function doBattle(){
    let container = $('.js-battle');
    let gameArea = $('.js-game', container);
    let hash = location.hash.slice(1);
    let gameId = hash.split('/')[1];
    let gameState = {};

    if (!gameId) {
      location.hash = 'sessions';
      return false;
    }

    assignToGame(gameId);

    gameArea.addEventListener('click', function(e){
      if (e.target.matches('[data-index]:not(.disabled)')) {
        let index = +e.target.dataset.index;
        e.target.classList.add('disabled');
        makeAction(index, gameState);
      }
    });
    
    (function poll() {
      fetch(`/session/${gameId}`)
        .then(resp => resp.json())
        .then(session=>{
          renderGame(session);
          if (gameState.winner == "no") {
            setTimeout(poll, 2000);
          }
        });
    }());


    function assignToGame() {
      fetch(`/session/${gameId}`)
      .then(resp => resp.json())
      .then(session=>{
        gameState = Object.assign({}, session);
        
        if (!localStorage.getItem('gameId')) {
          localStorage.setItem('gameId', gameState.id);

          gameState.playerB = username;
          gameState.startTime = (new Date()).getTime();

          return fetch(`/session/${gameId}`, {
            method: 'PUT', 
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(gameState)
          })
          .then(resp => resp.json());
        }
        
        return gameState;
      })
      .then(session=>{
        renderGame(session);
      });
    }

    function getYourTool(session) {
      return (username == session.playerA) ? session.toolA : session.toolB;
    }
    function getYourToolTitle(session) {
      return (username == session.playerA) ? session.toolA_title : session.toolB_title;
    }
  
    function renderGame(session) {
      gameState = Object.assign({}, session);
      container.innerHTML = '';

      let nextStep = (session.step % 2 == 0) ? session.toolA : session.toolB;
      let nextStepTitle = (session.step % 2 == 0) ? session.toolA_title : session.toolB_title;
  
      let nextStepEl = $('.js-battle .move span');
      console.log('nextStepEl: ', nextStepEl);
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

    function makeAction(index, gameState) {
      gameState.step++;
      gameState.state[index] = getYourTool(gameState);

      return fetch(`/session/${gameId}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameState)
      })
      .then(resp => resp.json())
      .then(session => renderGame(session, true));
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
  
})();