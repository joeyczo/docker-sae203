// panelChanger.js

async function changerPanel(panel) {
    try {
        let result = await fetch('/' + panel);
        if (!result.ok) {
            throw new Error(`Ne marche pas status: ${result.status}`);
        } else {
            let text = await result.text();
            $("body").html(text);
        }
    } catch (e) {
        console.log('il ya un prblm: ' + e.message);
    }
}

export default changerPanel;