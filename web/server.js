const express = require('express');
const path = require('path');
const dotenv = require('dotenv');


dotenv.config();

const app = express();

// Configuration des middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


//Middleware pour forcer le HTTPS
// app.use((req, res, next) => {
// 	if (req.protocol !== 'https') {
// 		return res.redirect(`https://${req.get('host')}${req.url}`);
// 	}
// 	next();
// });


app.get('/clement', (req, res) => {
	res.redirect('https://www.youtube.com/watch?v=XqZsoesa55w');
});


const port = 8080;
app.listen(port, () => {
	console.log(`Serveur démarré sur le port ${port}`);
});