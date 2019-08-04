
function $(s, parent = document) {
  return parent.querySelector(s);
}

function $$(s, parent = document) {
  return parent.querySelectorAll(s);
}

// const App = {
//   init(){
//     console.log('init!');
//     this.cacheElements();
//     this.bindEvents();
//   },
//   bindEvents(){
//     window.addEventListener('load', this.onHashChange);
//     window.addEventListener('hashchange', this.onHashChange);
//   },
//   cacheElements(){
//     this.$templates = $$('.container');
//   },
//   onHashChange(){
//     //let hash = location.hash.slice(1);
//     console.log('hash: ', hash);
//   },
//   showScreen(name){

//   },
// };

const RouteParser = {
  pattern(origin){
    let query = {origin, params: {}};
    let pattern = [], pMap = [];
    let i = 1;

    origin.split('/').map(s => {
      if (!/:/.test(s)) {
        pattern.push(s);
      } else {
        let tmp = s.split(':');
        pattern.push(tmp[1]);
        pMap[i++] = tmp[0];
      }
    });
    
    query.pattern = pattern.join('/');
    return query;
  },

  params(origin){
    let url = location.hash.slice(1) || '/';
    let query = {origin, /*url,*/ params: {}};
    let pattern = [], pMap = [];
    let i = 1;

    origin.split('/').map(s => {
      if (!/:/.test(s)) {
        pattern.push(s);
      } else {
        let tmp = s.split(':');
        query.params[tmp[0]] = tmp[1];
        pattern.push(tmp[1]);
        pMap[i] = tmp[0];
      }
    });
    
    query.pattern = pattern.join('/');

    let matches = url.match((new RegExp(query.pattern, "ig")));


    console.log('matches: ', matches);
    console.log('map: ', Object.keys(pMap));
    console.log('query: ', query);
    return query;
  },

};

const Router = {
  _url: '/',
  _routes: {},
  onBeforeApply(){
    // insert your code here
    return true;
  },
  onAfterApply(){
    // insert your code here
  },
  bindEvents(){
    window.addEventListener('load', this.onHashChange.bind(this));
    window.addEventListener('hashchange', this.onHashChange.bind(this));
  },
  parseUrl(origin){
    let url = location.hash.slice(1) || '/';
    let query = {origin, /*url,*/ params: {}};
    let pattern = [], pMap = [];
    let i = 1;

    origin.split('/').map(s => {
      if (!/:/.test(s)) {
        pattern.push(s);
      } else {
        let tmp = s.split(':');
        query.params[tmp[0]] = tmp[1];
        pattern.push(tmp[1]);
        pMap[i] = tmp[0];
      }
    });
    
    query.pattern = pattern.join('/');

    let matches = url.match((new RegExp(query.pattern, "ig")));


    console.log('matches: ', matches);
    console.log('map: ', Object.keys(pMap));
    console.log('query: ', query);
    return query;
  },
  onHashChange(){
    this.url = location.hash.slice(1) || '/';
    // this.parseUrl(this.url);

    if (!this.onBeforeApply(this.url)) return !1;

    // /battle/id:(\d+)/tmp:(\d+)
    let query = {
      url: this.url,
      params: {}
    }

    this._routes[this.url] 
      ? this._routes[this.url]()
      : this.error404();

    this.onAfterApply()
  },
  add(pattern, route){
    let query = this.parseUrl(pattern);
    this._routes[query.pattern] = route.bind(this);
    return this;
  },
  error404(){
    console.log('Error 404!', this.url);
  },
  interact() {
    this.bindEvents();
  }
}; 

document.addEventListener('DOMContentLoaded', function(){
  Router
  .add('/', function(){
    // console.log('/', arguments)
  })
  .add('/sessions', function(){
    // console.log('/sessions', arguments)
  })
  .add('/battle/id:(\\\\d+)', function(){
    // console.log('/battle/id:(\d+)', arguments)
  })
  .interact();
});








// (function () {

//   let containers = document.querySelectorAll('.container');
//   let container = document.querySelector('.js-game');

//   let username = localStorage.getItem('username');
//   let gameId = localStorage.getItem('gameId');
  
//   if (location.hash == '' || !username)
//     location.hash = 'sign-in';

//   if (gameId) {
//     location.hash = `battle/${gameId}`;
//   }

//   window.onload = window.onhashchange = function(){
//     hash = location.hash.split('#')[1];
//     console.log('hashchange', hash);
//     showPage(hash);
//   }

//   function showPage(hash) {
//     let chunk = hash.split('/');

//     containers.forEach(function(o, i){
//       if (!o.matches('.js-'+chunk[0])) {
//         o.classList.add('hidden');
//       } else {
//         o.classList.remove('hidden');
//       }
//     });

//     if (chunk[0] == 'sign-in') {
//       let signIn = document.querySelector('.js-sign-in');
//       let usernameInp = signIn.querySelector('input[type=text]');
//       let usernameSave = signIn.querySelector('button');

//       if (username) location.hash = 'session-list';

//       usernameSave.addEventListener('click', function(){
//         username = usernameInp.value;
//         if (username) {
//           localStorage.setItem('username', username);
//           location.hash = 'session-list';
//         }
//       });
//     }

//     if (chunk[0] == 'session-list') {
      
//       fetch(`/session?winner=no`)
//       .then(resp => resp.json())
//       .then((items)=>{
//         let container = document.querySelector('.js-session-wrap');
//         container.innerHTML = '';

//         items.forEach((el, i) => {
//           container.insertAdjacentHTML('beforeend', [
//             '<div>',
//               '<a onclick="return confirm(\'Вы уверены что хотите начать игру?\')" href="#battle/'+el.id+'">#'+el.id+': '+el.title+'</a>',
//             '</a>',
//           ].join(''));
//         })
//       })

//     }

//     if (chunk[0] == 'battle') {
//       let gameId = chunk[1];

//       if (gameId != '') {
//         let stateGame = {};

//         fetch(`/session/${gameId}`)
//         .then(resp => resp.json())
//         .then(session=>{
//           stateGame = Object.assign({}, session);
          
//           if (!localStorage.getItem('gameId')) {
//             localStorage.setItem('gameId', stateGame.id);

//             stateGame.playerB = username;
//             stateGame.startTime = (new Date()).getTime();

//             return fetch(`/session/${gameId}`, {
//               method: 'PUT', 
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify(stateGame)
//             })
//             .then(resp => resp.json());
//           }
          
//           return stateGame;
//         })
//         .then(session=>{
//           renderGame(session);
//         });

//         container.addEventListener('click', function(e){
//           if (e.target.matches('[data-index]:not(.disabled)')) {
//             let index = +e.target.dataset.index;
//             e.target.classList.add('disabled');
            
//             stateGame.step++;
//             stateGame.state[index] = getYourTool(stateGame);
  
//             fetch(`/session/${gameId}`, {
//               method: 'PUT', 
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify(stateGame)
//             })
//             .then(resp => resp.json())
//             .then(session => renderGame(session, true));
//           }
//         });
        
//         (function poll() {
//           fetch(`/session/${gameId}`)
//             .then(resp => resp.json())
//             .then(session=>{
//               renderGame(session);
//               if (stateGame.winner == "no") {
//                 setTimeout(poll, 2000);
//               }
//             });
//         }());


//         function getYourTool(session) {
//           return (username == session.playerA) ? session.toolA : session.toolB;
//         }
//         function getYourToolTitle(session) {
//           return (username == session.playerA) ? session.toolA_title : session.toolB_title;
//         }
      
//         function renderGame(session) {
//           stateGame = Object.assign({}, session);
//           container.innerHTML = '';

//           let nextStep = (session.step % 2 == 0) ? session.toolA : session.toolB;
//           let nextStepTitle = (session.step % 2 == 0) ? session.toolA_title : session.toolB_title;
      
//           let nextStepEl = document.querySelector('.js-battle .move span');
//           nextStepEl.innerHTML = nextStepTitle;
      
//           let titleEl = document.querySelector('.js-battle .title');
//           titleEl.innerHTML = `${username}, Вы играете "${getYourToolTitle(session)}"`;

//           let canIStep = (getYourTool(session) == nextStep);

//           session.state.forEach((el, i) => {
//             let cssClass = (el!==null ? ((el === 1) ? 'tic' : 'tac') : '');
      
//             cssClass += ((el !== null) || !canIStep) ? ' disabled' : '';
      
//             container.insertAdjacentHTML('beforeend', [
//               '<div data-index="'+i+'" data-value="'+el+'" class="col '+cssClass+'"></div>',
//             ].join(''));
//           });
      
//           checkWinner(session);
//         }
      
      
//         function checkWinner(session) {
//           let cols = container.querySelectorAll('.col');
      
//             if
//             (cols[0].matches('.tic') && cols[1].matches('.tic') && cols[2].matches('.tic') ||
//                 cols[3].matches('.tic') && cols[4].matches('.tic') && cols[5].matches('.tic') ||
//                 cols[6].matches('.tic') && cols[7].matches('.tic') && cols[8].matches('.tic') ||
//                 cols[0].matches('.tic') && cols[3].matches('.tic') && cols[6].matches('.tic') ||
//                 cols[1].matches('.tic') && cols[4].matches('.tic') && cols[7].matches('.tic') ||
//                 cols[2].matches('.tic') && cols[5].matches('.tic') && cols[8].matches('.tic') ||
//                 cols[0].matches('.tic') && cols[4].matches('.tic') && cols[8].matches('.tic') ||
//                 cols[2].matches('.tic') && cols[4].matches('.tic') && cols[6].matches('.tic')) {
//                 // winnerText.innerHTML = 'Победили крестики!';
//                 // winner.classList.add('active');
//                 endGame(session, 1);
//             } else if
//             (cols[0].matches('.tac') && cols[1].matches('.tac') && cols[2].matches('.tac') ||
//                 cols[3].matches('.tac') && cols[4].matches('.tac') && cols[5].matches('.tac') ||
//                 cols[6].matches('.tac') && cols[7].matches('.tac') && cols[8].matches('.tac') ||
//                 cols[0].matches('.tac') && cols[3].matches('.tac') && cols[6].matches('.tac') ||
//                 cols[1].matches('.tac') && cols[4].matches('.tac') && cols[7].matches('.tac') ||
//                 cols[2].matches('.tac') && cols[5].matches('.tac') && cols[8].matches('.tac') ||
//                 cols[0].matches('.tac') && cols[4].matches('.tac') && cols[8].matches('.tac') ||
//                 cols[2].matches('.tac') && cols[4].matches('.tac') && cols[6].matches('.tac')) {
//                 // winnerText.innerHTML = 'Победили нолики!';
//                 // winner.classList.add('active');
//                 endGame(session, 2)
//             } else if (session.step == 9) {
//                 // winnerText.innerHTML = 'Ничья!';
//                 // winner.classList.add('active');
//                 endGame(session, 0)
//             }
//         }
      
//         function endGame(session, winner) {
//           session.winner = winner;
//           session.endTime = (new Date()).getTime();
      
//           let messages = [
//             'Ничья!',
//             'Победили крестики!',
//             'Победили нолики!',
//           ];
      
//           return fetch(`/session/${gameId}`, {
//             method: 'PUT', 
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(session)
//           })
//           .then(resp => resp.json())
//           .then(session => {
//             alert(messages[winner]);
//             gameId = null;
//             localStorage.removeItem('gameId');
//             location.href = '/';
//           });
//         }
      
//       }
//     }
//   }

// })();