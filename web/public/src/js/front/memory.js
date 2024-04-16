import changerPanel from '../server/panelChanger.js';
import socket from '../server/socket.js';

console.log("memory.js front chargé");

var monNom;

socket.emit('getName', (user) => {
    console.log('Vous êtes : ', user);
    monNom = user;
});

$(() => {

    socket.emit('startMemoryGame');
    socket.emit('getNumJoueurRegleMemory');

    $(".card").on('click', function()
    {

        if (!$(".plateau").hasClass('disabled'))
        {
            $(this).addClass('cd-back');
        }


    });

    $(".malus-infos").hide();

});

/**
 * Anime la victoire de Memory
 */
window.animeWinMemory = () => {

    $(".modal-infos").show();
    $(".modal-infos .win").css({'display':'flex','top':'-100vh'}).animate({'top':'0'}, 500);

    setTimeout(() => {

        $(".modal-infos .win").animate({'top':'100%'}, 500, () => {
            $(".modal-infos").hide();
        });

    }, 4000);

}

/**
 * Anime la défaite de Memory
 */
window.animeLooseMemory = () => {

    $(".modal-infos").show();
    $(".modal-infos .loose").css({'display':'flex','top':'-100vh'}).animate({'top':'0'}, 500);

    setTimeout(() => {

        $(".modal-infos .loose").animate({'top':'100%'}, 500, () => {
            $(".modal-infos").hide();
        });

    }, 4000);

}

/**
 * Le joueur a bien lu les règles
 */
window.playerReadedRule = () => {
    socket.emit('newPlayerReadedRules');

    $("#btn_rules").remove();
}

/**
 * Le joueur a retourné une mauvaise paire
 */
window.wrongCardMemory = () => {

    $(".modal-infos").css({'opacity':'0','background': 'rgba(118,0,0,0.6)'}).show().animate({'opacity':'1'}, 150, () => {

        $(".modal-infos").animate({'opacity':'0'}, 150, () => {
            $(".modal-infos").css({'opacity':'1','background':'transparent'}).hide();
        });

    });

}

/**
 * Le joueur a retourné une bonne paire
 */
window.goodCardMemory = () => {

    $(".modal-infos").css({'opacity':'0','background': 'rgba(0,118,0,0.6)'}).show().animate({'opacity':'1'}, 150, () => {

        $(".modal-infos").animate({'opacity':'0'}, 150, () => {
            $(".modal-infos").css({'opacity':'1','background':'transparent'}).hide();
        });

    });

}



/* -------------------------------------------------------------------------- */

socket.on('showPlayerToReadMemory', (num) => {

    $("#player_reste").text(num);

})

socket.on('hideModalMemory', () => {
    $(".modal-consigne").hide();
})

socket.on('showPlayerRoundMemory', (players) => {

    console.log("Affichage des joueurs");

    $(".list-player").empty();

    if (players[0].uid === monNom.uid) {
        $("#player_round").html(`<span style="color: green";>${players[0].name}</span>`);
    } else {
        $("#player_round").html(`<span style="color: red";>${players[0].name}</span>`);
    }

    players.forEach(player => {

        var txt = `
        <div class="item">

                <div class="icon">

                    <img src="../img/player.svg" alt="Joueur" draggable="false">

                </div>

                <div class="infos">

                    <p>${player.name}</p>

                </div>

            </div>`;

        $(".list-player").append(txt);

    });

})

socket.on('generateCardsMemory', (cards) => {

    $(".plateau").empty();

    console.log(cards);

    cards.forEach(card => {

        var txt = `
        <div id="${card.id}" class="card">
            <div class="face"></div>
            <div class="fond"></div>
        </div>
        `;

        $(".plateau").append(txt);

    });

    $(".card").on('click', function()
    {

        if (!$(".plateau").hasClass('disabled') && !$(this).hasClass('cd-back'))
        {

            socket.emit('clickCardMemory', $(this).attr('id'), monNom.uid);

            $(this).addClass('cd-back');
        }


    });

})

socket.on('activatePlayer', (uid) => {

    if (uid === monNom.uid) {
        $(".plateau").removeClass('disabled');
    }

})

socket.on('disabledAllPlayerMemory', () => {
    $(".plateau").addClass('disabled');
})

socket.on('changerStyleMemory', (grid) => {
    $(".plateau").css({'grid-template-columns' :`repeat(${grid}, 1fr)`});
})

socket.on('returnCard', (id) => {

    wrongCardMemory();

    setTimeout(() => {
        $(`#${id}`).removeClass('cd-back');
        $(`#${id} .face`).css({'background-image': 'none'});
    }, 1000);

});

socket.on('goodCard', (id) => {

    goodCardMemory();

})

socket.on('otherPlayerCard', (id, uid) => {

    if (uid === monNom.uid) {
        return;
    }

    console.log("Retournement cartes");

    $(`#${id}`).addClass('cd-back');

})

socket.on('setImageCard', (id, image) => {
    $(`#${id} .face`).css({'background-image': `url('../img/memory/${image}')`});
});

socket.on('endGameMemory', () => {
    animeWinMemory();
});


/* -------------------------------------CHAT------------------------------------------------------------------ */


     var formElement = document.getElementById('form');
     var inputElement = document.getElementById('input');
     var buttonElement = document.querySelector('.chat button');
     var msg = document.querySelector('.chat .msg');
     var chat = document.querySelector('.chat');
     var btnClose = document.getElementById('btnClose');
     var ecrit = document.getElementById('ecrit');


     buttonElement.addEventListener('click', function() {
         envoyerMessage();
     });

     formElement.addEventListener('submit', function(e) {
         e.preventDefault();
         envoyerMessage();
     });

     inputElement.addEventListener('keypress', function(e) {
         if (e.key === 'Enter') {
             envoyerMessage();
         }
     });


     inputElement.addEventListener('input', function(e) {
              socket.emit('entrain ecrire', monNom);
          });

     function envoyerMessage() {
         var inputValue = inputElement.value.trim();
         if (inputValue !== '') {
             socket.emit('chat message', { nom : monNom.name ,msg: inputValue, uid: monNom.uid});
             inputElement.value = '';
         }
     }

     btnClose.addEventListener('click', function(e) {
          if ( chat.className === "chat" )
          {
            chat.classList.add('c-closed');
          }
          else
          {
            chat.classList.remove('c-closed');
          }
     });


     socket.on('entrain ecrire', function(usersEcrit) {
        var item = document.createElement('p');
        var listeNom = "";

        for (var uid in usersEcrit) {
            listeNom += usersEcrit[uid].name;

            if ( listeNom !== "" )
                listeNom += ", ";

        }

        if ( listeNom !== "")
            item.textContent = listeNom + " est entrain d'écrire ...";

        ecrit.innerHTML = "";
        ecrit.appendChild(item);
     });


     socket.on('chat message', function(message) {
         var ajoutItem = document.createElement('div');
         ajoutItem.classList.add("item");


         var ajoutNom = document.createElement('div');
         ajoutNom.classList.add("author");
         ajoutNom.textContent = message.nom;


         var ajoutTxt = document.createElement('div');
         ajoutTxt.classList.add("cnt");
         ajoutTxt.textContent = message.msg;

         ajoutItem.appendChild(ajoutTxt);
         ajoutItem.appendChild(ajoutNom);

         msg.appendChild(ajoutItem);
         msg.scrollTo(0, msg.scrollHeight);
     });



