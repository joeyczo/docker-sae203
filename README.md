# Instruction d'installation

- Cloner le dépot git :

```bash
git clone git@github.com:joeyczo/docker-sae203.git
```

- Se rendre dans le dossier du projet :

```bash
cd docker-sae203
```

- Construction de l'image docker :

```bash
sudo docker build -t plateau
```

- Lancer le service :

```bash
sudo docker run -p 7696:7696 -v $(pwd):/usr/src/app -e NB_JOUEUR=nbJoueur -e NB_PARTIE=nbPartie -it plateau
```

*nb_joueur* signifie le nombre de joueur dans la partie

> **Attention** : <br>
> Le jeu ne se lancera pas tant que le nombre minimum de joueur n'est pas atteint. <br>

*nb_partie* signifie le nombre de partie à jouer

> **Note** : <br>
> Une partie signifie une manche de jeu. *(Ex : Dos, Memory, ...)*

- Pour lancer le jeu, ouvrir un navigateur et se rendre à l'adresse suivante :

```bash
http://localhost:7696
```