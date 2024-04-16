import changerPanel from '../server/panelChanger.js';
import socket from '../server/socket.js';

console.log("simon.js front chargé");


var monNom;

socket.emit('getName', (user) => {
    console.log('Vous êtes : ', user);
    monNom = user;
});

$(() => {

    socket.emit('startGameSimon');
    socket.emit('getNumJoueurRegleSimon');

    $(".disp-formes .item").on('click', function() {

        if (!$(".prt-simon").hasClass('disabled')) {

            $(this).removeClass('dis');

            var id = $(this).attr('id');

            var numId = parseInt(id.replace('f', '')) - 1;

            socket.emit('clickedForme', numId, monNom);

            setTimeout(function() {
                $(`#${id}`).addClass('dis');
            }, 200);

        }

    });

    $(".malus-infos").hide();

    socket.emit('getPlayersSimon');

});

/**
 * Activation des formes (Uniquement depuis le serveur)
 * @param num ID de la forme
 */
window.activateForme = num => {


    var tNum = parseInt(num) + 1;

    $(`#f${tNum}`).removeClass('dis');

    setTimeout(function() {$
        (`#f${tNum}`).addClass('dis');
    }, 200);

}

/**
 * Anime la victoire de Simon
 */
window.animeWinSimon = () => {

    $(".modal-infos").show();
    $(".modal-infos .win").css({'display':'flex','top':'-100vh'}).animate({'top':'0'}, 500);

    setTimeout(() => {

        $(".modal-infos .win").animate({'top':'100%'}, 500, () => {
            $(".modal-infos").hide();
        });

    }, 4000);

}

/**
 * Anime la défaite de Simon
 */
window.animeLooseSimon = () => {

    $(".modal-infos").show();
    $(".modal-infos .loose").css({'display':'flex','top':'-100vh'}).animate({'top':'0'}, 500);

    setTimeout(() => {

        $(".modal-infos .loose").animate({'top':'100%'}, 500, () => {
            $(".modal-infos").hide();
        });

    }, 4000);

}

/**
 * Animation lors du mauvais clique
 */
window.endGameLoose = () => {

    $(".modal-infos").css({'opacity':'0','background': 'red'}).show().animate({'opacity':'1'}, 150, () => {

        $(".modal-infos").animate({'opacity':'0'}, 150, () => {
            $(".modal-infos").css({'opacity':'1','background':'transparent'}).hide();

            setTimeout(() => {

                animeLooseSimon();

            }, 300);
        });

    });

}

/**
 * Anime le clique du joueur
 * @param num ID de la forme
 */
window.animatePlayerClick = (num) => {


    $(`#f${num + 1}`).css({'opacity': "0.5"});

    setTimeout(() => {
        $(`#f${num + 1}`).attr('style', '');
    }, 200);

}

window.setMalusSimon = (uid, username, duration) => {

    if (uid === monNom.uid) {
        $(".malus-infos").show();

        $(".prt-simon").addClass('malus');

        $(".malus-infos p.user").html('Par ' + username);

        setTimeout(() => {

            $(".malus-infos").hide();
            $(".prt-simon").removeClass('malus');

        }, duration)

    }

}

window.readedRegleSimon = () => {

    socket.emit('readedRegleSimon');

    $("#btn_regle").remove();

}



/* ------------------------ */

socket.on('endGameSimon', (uid) => {

    if (uid === monNom.uid) {
        endGameLoose();
    }
})

socket.on('sendColorAffichage', (array) => {

    for (var i = 0; i < array.length; i++) {
        setTimeout(activateForme, i * 600, array[i]);
    }

    setTimeout(() => {
        socket.emit('endAffichageSimon');
    }, array.length * 600);

})

socket.on('showPlayerRoundSimon', (array) => {

    console.log("Chargement des joueurs");

    $(".list-player").empty();

    if (array[0].uid === monNom.uid) {
        $("#player-name-tour").html(`<span style="color: green";>${array[0].name}</span>`);
    } else {
        $("#player-name-tour").html(`<span style="color: red";>${array[0].name}</span>`);
    }

    array.forEach(player => {

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

});

socket.on('enableGameSimon', (uid) => {

    console.log("Activation du jeu");

    if (uid === monNom.uid) {
        $(".prt-simon").removeClass('disabled');
    }

})

socket.on('disableGameSimon', () => {
    $(".prt-simon").addClass('disabled');
})

socket.on('winGameSimon', (uid) => {

    if (uid === monNom.uid) {
        animeWinSimon();
    }

})

socket.on('animationPlayerClick', (uid, num) => {

    console.log("Animation couleur");

    if (uid !== monNom.uid)
    {
        animatePlayerClick(num);
    }

})

socket.on('setMalusSimon', (uid, username, duration) => {
    setMalusSimon(uid, username, duration);
});

socket.on('showPlayerToReadSimon', (num) => {
    $("#count_joueur_see").html(num);
})

socket.on('hideModalSimon', () => {
    $(".modal-consigne").hide();
})


/* -------------------------------------CHAT------------------------------------------------------------------ */

     var formElement = document.getElementById('form');
     var inputElement = document.getElementById('input');
     var buttonElement = document.querySelector('.chat button');
     var messages = document.getElementById('messages');

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

     function envoyerMessage() {
         var inputValue = inputElement.value.trim();
         if (inputValue !== '') {
             socket.emit('chat message', { nom : monNom.name ,msg: inputValue, });
             inputElement.value = '';
         }
     }

     socket.on('chat message', function(msg) {
         var item = document.createElement('li');
         item.textContent = msg.nom + " -> " + msg.msg;
         messages.appendChild(item);
         window.scrollTo(0, document.body.scrollHeight);
       });