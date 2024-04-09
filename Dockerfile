FROM debian:latest

RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | -E bash -
RUN apt-get install -y nodejs npm


RUN node -v


# Définir la variable d'environnement NB_JOUEUR
ENV NB_JOUEUR=nbJoueur
ENV NB_PARTIE=nbPartie
# sudo docker build -t plateau . pour build l'app
# La commande 'docker run -e NB_JOUEUR=nbJoueur -e NB_PARTIE=nbPartie -it plateau

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier package.json et package-lock.json (si disponible)
COPY package*.json ./


# Installer les dépendances de l'application
RUN npm install

# Copier le reste des fichiers de l'application dans le conteneur
COPY . .


CMD [ "npm", "start" ]