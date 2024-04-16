async function changerPanel(panel) {
    try {
        let result = await fetch('/' + panel);
        if (!result.ok) {
            throw new Error(`Ne marche pas status: ${result.status}`);
        } else {
            let text = await result.text();
            $("body").html(text);
            // Obtenez toutes les balises script dans le nouveau contenu HTML
            let parser = new DOMParser();
            let doc = parser.parseFromString(text, "text/html");
            let scripts = doc.getElementsByTagName('script');
            // Ajoutez un paramètre de requête unique à l'URL de chaque script
            for (let script of scripts) {
                if (script.src) {
                    let url = new URL(script.src);
                    url.searchParams.set('t', Date.now());
                    script.src = url.href;
                }
            }
            // Remplacez le contenu du corps avec le nouveau contenu HTML
            $("body").html(doc.body.innerHTML);
            console.log("Changement de panel -> " + panel);
        }
    } catch (e) {
        console.log('il ya un prblm: ' + e.message);
    }
}

export default changerPanel;