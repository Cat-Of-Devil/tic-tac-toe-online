
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

    if (username) {
      location.hash = `sessions`;
      return false;
    }
    
    showScreen(container);

    $('form', container).addEventListener('submit', function(e){
      e.preventDefault();
      username = e.target.username.value;
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

    $('form', container).addEventListener('submit', function(e){
      e.preventDefault();

      fetch(`${location.origin}/session`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "title": e.target.title.value,
          "playerA": username,
          "playerB": null,
          "winner": "no",
          "createdTime": (new Date()).getTime(),
          "startTime": null,
          "endTime": null,
          "toolA": 1,
          "toolB": 0,
          "toolA_title": "X",
          "toolB_title": "0",
          "step": 0,
          "state": [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ]
        })
      })
      .then(resp => resp.json())
      .then((session)=>{
        location.hash = `battle/${session.id}`;
      });
    });
    
    fetch(`${location.origin}/session?winner=no`)
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

    showScreen(container);
    assignToGame(gameId);

    gameArea.addEventListener('click', function(e){
      if (e.target.matches('[data-index]:not(.disabled)')) {
        let index = +e.target.dataset.index;
        e.target.classList.add('disabled');
        makeAction(index, gameState);
      }
    });
    
    (function poll() {
      fetch(`${location.origin}/session/${gameId}`)
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

    function yourTool(session) {
      return (username == session.playerA) ? session.toolA : session.toolB;
    }
    function yourToolTitle(session) {
      return (username == session.playerA) ? session.toolA_title : session.toolB_title;
    }
  
    function renderGame(session) {
      gameState = Object.assign({}, session);
      gameArea.innerHTML = '';

      let nextStep = (session.step % 2 == 0) ? session.toolA : session.toolB;
      let nextStepTitle = (session.step % 2 == 0) ? session.toolA_title : session.toolB_title;
  
      let nextStepEl = $('.move span', container);
      nextStepEl.innerHTML = nextStepTitle;
  
      let titleEl = $('.title', container);
      titleEl.innerHTML = `${username}, Вы играете "${yourToolTitle(session)}"`;

      let canIStep = (yourTool(session) == nextStep);

      session.state.forEach((el, i) => {
        let cssClass = (el!==null ? ((el === 1) ? 'tic' : 'tac') : '');
  
        cssClass += ((el !== null) || !canIStep) ? ' disabled' : '';
  
        gameArea.insertAdjacentHTML('beforeend', [
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
            endGame(session, 2)
        } else if (session.step == 9) {
            endGame(session, 0)
        }
    }

    function makeAction(index, gameState) {
      gameState.step++;
      gameState.state[index] = yourTool(gameState);

      return fetch(`${location.origin}/session/${gameId}`, {
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
  
      return fetch(`${location.origin}/session/${gameId}`, {
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
        location.href = 'sessions';
      });
    }
  }
  
})();