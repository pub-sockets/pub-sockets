var db = require('./db/DatabaseManager.js');
var PubGameModel = require('./GameModel.js');

//Setup for: only one game at a time
var allUsers = {};
var allGames = {};
var allLobbyGames = [];

module.exports = {
  init : function(expressServer) {
    io = require('socket.io')(expressServer);

    io.on('connection', function(userSocket) {

      //////////////////////////////////////////
      /// New user has connected actions 
      //////////////////////////////////////////

      var userId = userSocket.id;

      //Makes a new user
      allUsers[userId] = {
        name: animals[counter],
        gameId: null,
        id: userId,
        socket: userSocket
      }
      counter++;
      
      //Emits lobbies to all users (fix)
      io.emit('newData', {
        lobbies:allLobbyGames,
          lobbyDisplay: false,
          lobbyListDisplay: true
      });

      userSocket.emit('newData', {
        username:allUsers[userId].name
      });

      //////////////////////////////////////////
      /// Lobby actions
      //////////////////////////////////////////

      var findLobby = function(id, lobbyId, callback) {
        for(var i = 0; i < allLobbyGames.length; i++){
          if(lobbyId === allLobbyGames[i].gameId) {
            console.log('got to the lobby');
            if(allLobbyGames[i].users.indexOf(allUsers[id].name) === -1){
              console.log('allLobbyGames[i]]');
              console.log(allLobbyGames[i]);
              callback(allLobbyGames[i]);
              break;
            }
            return null;
          }
        }
      }

      //User makes a new game lobby
      userSocket.on('newGameLobby', function() {
        console.log('newGameLobby');
        var newGameLobby = {
          users: [allUsers[userId].name],
          userIds: [userId],
          gameId: Math.floor(Math.random()*1000000000000000000),
          gameModel: null,
          closed: false
        }
        allLobbyGames.push(newGameLobby);
        allUsers[userId].gameId = newGameLobby.gameId;
        //Emits new lobby data to everyone
        io.emit('newData', {lobbies:allLobbyGames});
        //Puts new lobby creator in their new lobby
        userSocket.emit('newData', {
          lobbies: allLobbyGames,
          lobbyDisplay: true,
          lobbyListDisplay: false
        });
      });

      //User joins a game lobby
      userSocket.on('joinGameLobby', function(lobby) {
        console.log('joinGameLobby');
        allUsers[userId].gameId = lobby.gameId;
        findLobby(userId, allUsers[userId].gameId, function(foundLobby) {
          console.log('foundLobby');
          console.log(foundLobby);
          foundLobby.users.push(allUsers[userId].name);
          foundLobby.userIds.push(userId);
          //Updates everyone's lobby data
          io.emit('newData', {lobbies:allLobbyGames});
          //Puts lobby joiner in their new lobby
          userSocket.emit('newData', {
            lobbies:allLobbyGames,
            lobbyDisplay: true,
            lobbyListDisplay: false
          });
        });
      });

      //User closes a lobby
      userSocket.on('closeLobby', function() {
        console.log('closeLobby');

      });

      //User opens a lobby 
      userSocket.on('openLobby', function() {
      });

      //User starts a game
        //TODO: force the user to close the lobby first
      userSocket.on('startGame', function() {
        console.log('startGame');
        //Finds the game this user is in
        var relevantGame;
        for(var i = 0; i < allLobbyGames.length; i++){
          if(allLobbyGames[i].gameId === allUsers[userId].gameId){
            relevantGame = allLobbyGames[i];
            break;
          }
        }
        console.log('relevantGame:');
        console.log(relevantGame)
        var newGameModel = new PubGameModel();
        relevantGame.gameModel = newGameModel;
        //Removes this game from the lobby list
        var lobbyIndex = allLobbyGames.indexOf(relevantGame);
        if(lobbyIndex > -1) allLobbyGames.splice(lobbyIndex, 1);
        //Updates everyone's lobby data (closing this lobby)
        io.emit('newData', {lobbies:allLobbyGames});        

        newGameModel.startGame(relevantGame, function(newData) {
          newData.lobbyDisplay = false;
          newData.lobbyListDisplay = false;

          //eventually, only emit to people in this room.
          //right now, just emit to all users
          relevantGame.userIds.forEach(function(userIdInLobby) {
            allUsers[userIdInLobby].socket.emit('newData', newData);
          });
        });
      });

      //////////////////////////////////////////
      /// In game actions
      //////////////////////////////////////////

      //User answers a question
      userSocket.on('answer', function(data) {
        console.log('answer');
        var relevantGame = allGames[allUsers[userId].gameId];
        relevantGame.registerAnswer(data, userId, callback);

        //eventually, only emit to people in this room
        io.emit('newData', newDataObject)
      });

      //User's client says the time has run out
      userSocket.on('gameEnd', function(data) {
        console.log('gameEnd');
        var relevantGame = allGames[allUsers[userId].gameId];

        //eventually, only emit to people in this room
        relevantGame.endGame(function(winnerData){
          console.log(winnerData);
        });
      });

      //////////////////////////////////////////

    });
  }
};

var counter = 0;
var animals = ["Pig","Giraffe","Monkey","Cow","Hippo","Squirrel",
               "Rat","Bat","Weasel","Wolverine","Turtle","Lion"];