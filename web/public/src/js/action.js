/**
 * Permet de générer un identifiant unique aléatoire
 * @param {Int} taille Taille de l'identifiant (Défaut 20)
 * @returns {String} La chaîne aléatoire
 */
var randomUID = (taille = 20) => {
    var uid = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < taille; i++) {
        uid += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return uid;
}


var playerJoined = name => {

    var rand = randomUID(10);

    var txt = `
    <div id="${rand}" class="item good">
            
        <div class="icon">

            <img src="../img/arrow_r.svg" alt="Flèche">
            
        </div>

        <p><b>${name}</b> vient d'arriver</p>
        
    </div>`;

    $(".msg-disp").append(txt);

    $("#" + rand).animate({'opacity':1}, 500);

    setTimeout(() => {

        $("#" + rand).animate({'opacity':0}, 500, function() {
            $(this).remove();
        });

    }, 5000);

}

var playerLeft = name => {

    var rand = randomUID(10);

    var txt = `
    <div id="${rand}" class="item error">

        <div class="icon">

            <img src="../img/arrow_e.svg" alt="Flèche">

        </div>

        <p><b>${name}</b> nous a quiité !</p>

    </div>
    `;

    $(".msg-disp").append(txt);

    $("#" + rand).animate({'opacity':1}, 500);

    setTimeout(() => {

        $("#" + rand).animate({'opacity':0}, 500, function() {
            $(this).remove();
        });

    }, 5000);

}

const donneeNumJeu = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Cinquième', 'Sixième', 'Septième', 'Huitième', 'Neuvième', 'Dixième', 'Onzième', 'Douxième', 'Flemme de compte ...'];

/**
 * Affiche le nom du jeu sur la page 'presentation.html'
 * @param obj Objet [ name : nom du jeu, number : numéro du jeu, maxJeu : nombre de jeu maximum, point : nombre de point max ]
 */
var showNewGame = obj => {

    $(".infos").hide().css({'opacity':'0'});
    $(".bg-game").hide().css({'opacity':'0'})
    $(".presentation p").css({'opacity':'0'});

    $(".presentation p").html('C\'est l\'heure du ' + donneeNumJeu[obj.number] + " jeu !").animate({'opacity':1}, 500);

    setTimeout(() => {

        $(".bg-game").show().animate({'opacity':1}, 500);

        setTimeout(() => {

            $(".bg-game h1").html(obj.name).css({'opacity':'0'}).animate({'opacity':1}, 500);

        }, 500);

    }, 1000);

    setTimeout(() => {

        var txt = `
        <p>Jeu N°${obj.number+1}/${obj.maxJeu}</p>

        <p>-</p>

        <p>${obj.point}pts</p>`;

        $(".infos").html(txt).css({'opacity':'0'}).show().animate({'opacity':1}, 500);

    }, 1800);


}