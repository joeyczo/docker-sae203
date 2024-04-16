$(() => {

});

/**
 * Déclenchement de l'animation du podium
 */
var showRanking = () => {

    $(".list-other").hide();
    $(".scd").hide();
    $(".first").hide();
    $(".third").hide();
    $(".fin-dst").hide();

    setTimeout(() => {

        $(".third").css({'height':'0%'}).show().animate({'height':'60%'}, 800)

    }, 400);

    setTimeout(() => {

        $(".scd").css({'height':'0%'}).show().animate({'height':'80%'}, 800)

    }, 1200);

    setTimeout(() => {

        $(".first").css({'height':'0%'}).show().animate({'height':'100%'}, 800)

    }, 2000);

    setTimeout(() => {

        $(".list-other").css({'opacity':'0'}).show().animate({'opacity':'1'}, 800)

    }, 3000);

    setTimeout(() => {

        $(".fin-dst").css({'opacity':'0'}).show().animate({'opacity':'1'}, 800);

        // Décompte de 10s

    }, 5000)

}