(function () {

  let containers = document.querySelectorAll('.container');
  let signIn = document.querySelector('.js-sign-in');

  let username = localStorage.getItem('username');

  if (location.hash == '' || !username)
    location.hash = 'sign-in';

  window.onhashchange = function(){
    
    let hash = location.hash.split('#')[1];
    console.log('hashchange', hash);

    showPage();




    if (hash == 'sign-in') {

      //signIn.classList.remove('hidden');
    }

    if (hash == 'session-list') {
      
    }

    if (hash == 'battle') {
      
    }
  }

  function showPage() {
    containers.forEach(function(o, i){
      if (!o.matches('.js-'+hash)) {
        o.classList.add('hidden');
      } else {
        o.classList.remove('hidden');
      }
    });
  }

  showPage();












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

  // close.addEventListener('click', function () {
  //         step = 0;
  //         cols.forEach(function (el) {
  //             el.classList.remove('tic', 'tac');
  //             el.addEventListener('click', ticTac);
  //             winner.classList.remove('active');
  //             move.innerHTML = 'x';
  //         })
  //     }
  // );


  // // console.log(cols)

})();