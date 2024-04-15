/**
 * Déclenchement de l'animation du podium
 */
var showRanking = () => {

    $(".list-joueur").hide();
    $(".second").hide();
    $(".first").hide();
    $(".third").hide();
    $(".fin").hide();

    setTimeout(() => {

        $(".third").css({'height':'0%'}).show().animate({'height':'60%'}, 800)

    }, 400);

    setTimeout(() => {

        $(".second").css({'height':'0%'}).show().animate({'height':'80%'}, 800)

    }, 1200);

    setTimeout(() => {

        $(".first").css({'height':'0%'}).show().animate({'height':'100%'}, 800)

    }, 2000);

    setTimeout(() => {

        $(".list-joueur").css({'opacity':'0'}).show().animate({'opacity':'1'}, 800)

    }, 3000);

    setTimeout(() => {

        $(".fin").css({'opacity':'0'}).show().animate({'opacity':'1'}, 800);

        decompteTimer();

    }, 5000)

}

/**
 * Décompte du timer jusqu'à 0
 */
var decompteTimer = () => {

    var time = 10;

    var intT = setInterval(() => {

        $(".fin h1").text(time-- + "s").addClass('bounce-a');

        if (time == -1) {
            clearInterval(intT);

            $(".fin h1").text('');
            $(".fin h2").text('Début du jeu imminent !')
        }

    }, 1000);

}