FROM debian:latest

RUN apt-get update && apt-get install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

RUN node -v

# Définir la variable d'environnement NB_JOUEUR
ENV NB_JOUEUR=nbJoueur
ENV NB_PARTIE=nbPartie

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier package.json et package-lock.json (si disponible)
COPY package*.json ./

# Installer les dépendances de l'application
RUN npm install

EXPOSE 7696

CMD [ "npm", "start" ]

#BUILD :
# sudo docker build -t plateau .
#RUN :
# sudo docker run -p 7696:7696 -v $(pwd):/usr/src/app -e NB_JOUEUR=nbJoueur -e NB_PARTIE=nbPartie -it plateau
