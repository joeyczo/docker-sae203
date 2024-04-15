/*
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
*/