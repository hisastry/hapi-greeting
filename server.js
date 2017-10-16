var Hapi = require("hapi");
var uuid = require("uuid");

var server = new Hapi.Server();

var cards = {}

server.connection({
  port: 3000
});

server.register(require('inert'), (err) => {

  if(err){
    throw err
  }

  server.ext('onRequest', function(request, reply){
     console.log('Request received for ' + request.path)
     reply.continue()
  });

  server.route({
    path: '/',
    method: 'GET',
    handler: {
      file:'templates/index.html'
    }
  });

  server.route({
    path: '/assets/{path*}',
    method: 'GET',
    handler: {
      directory: {
        path: './public',
        listing: false
      }
    }
  });

  const newCardHandler = (request, reply) => {
    if(request.method == 'get'){
      return reply.file('templates/new.html')
    } else {
      let card = {
        name: request.payload.name,
        recipient_email: request.payload.recipient_email,
        sender_name: request.payload.sender_name,
        sender_email: request.payload.sender_email,
        card_image: request.payload.card_image
      }
      saveCard(card)

      console.log(cards)

      return reply.redirect('/cards')
    }
  }

  function saveCard(card) {
    var id = uuid.v1()
    card.id = id
    cards[id] = card
  }

  const cardsHandler = (request, reply) => {
    reply.file('./templates/cards.html')
  }

  server.route({
    path: '/cards/new',
    method: ['GET', 'POST'],
    handler: newCardHandler
  })

  server.route({
    path: '/cards',
    method: 'GET',
    handler: cardsHandler
  });

  server.route({
    path: '/card/${id}',
    method: 'DELETE',
    handler: deleteCardHandler
  });

  function deleteCardHandler(request, reply) {
    delete cards[request.params.id]
  }
  server.start(function(){
    console.log('Server successfully started on ' + server.info.uri)
  });

});
