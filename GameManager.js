var db = require('./db/DatabaseManager.js');
var PubGameModel = require('./GameModel.js');
var _ = require('underscore');

//Setup for: only one game at a time
var allUsers = {};
var allGames = {};
var allLobbyGames = [];

module.exports = {
  initializeGameManager : function(expressServer) {
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

      var findLobby = function(callback) {
        var lobbyId = allUsers[userId].gameId;
        for(var i = 0; i < allLobbyGames.length; i++){
          if(lobbyId === allLobbyGames[i].gameId) {
            if(allLobbyGames[i].userIds.indexOf(userId) > -1){
              // They are in this lobby!
              callback(allLobbyGames[i], i);
              break;
            }
            console.log("user isn't in their lobby!");
            allLobbyGames[i].userIds.push(userId);
            allLobbyGames[i].users.push(allUsers[userId].name);
            callback(allLobbyGames[i], i);
          }
        }
      }

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

      userSocket.on('joinGameLobby', function(lobby) {
        console.log('joinGameLobby');
        console.log(lobby);
        allUsers[userId].gameId = lobby.gameId;
        findLobby(function(foundLobby){
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

      userSocket.on('leaveGameLobby', function() {
        console.log('leaveGameLobby');
        findLobby(function(foundLobby) {
          var thisUserIndex = foundLobby.userIds.indexOf(userId);
          foundLobbyusers.splice(thisUserIndex, 1);
          foundLobbyuserIds.splice(thisUserIndex, 1);
          //Updates everyone's lobby data
          io.emit('newData', {lobbies:allLobbyGames});
          //Puts lobby leaver back in the lobby list
          userSocket.emit('newData', {
            lobbies:allLobbyGames,
            lobbyDisplay: false,
            lobbyListDisplay: true
          });
        });
      });

      userSocket.on('removeGameLobby', function() {
        console.log('removeGameLobby');
        findLobby(function(foundLobby, foundLobbyIndex) {
          _.each(foundLobby.userIds, function(foundLobbyUserId) {
            allUsers[userId].gameId = null;
          });
          allLobbyGames.splice(foundLobbyIndex, 1);
          //Updates everyone's lobby data
          io.emit('newData', {lobbies:allLobbyGames});
          //Puts lobby leaver back in the lobby list
          userSocket.emit('newData', {
            lobbies:allLobbyGames,
            lobbyDisplay: false,
            lobbyListDisplay: true
          });
        });
      });


      userSocket.on('closeGameLobby', function() {
        console.log('closeGameLobby');
        findLobby(function(foundLobby) {
          foundLobby.closed = true;
          //Updates everyone's lobby data
          io.emit('newData', {lobbies:allLobbyGames});
        });
      });

      userSocket.on('openGameLobby', function() {
        console.log('openGameLobby');
        findLobby(function(foundLobby) {
          foundLobby.closed = false;
          //Updates everyone's lobby data
          io.emit('newData', {lobbies:allLobbyGames});
        });
      });

        //TODO: force the user to close the lobby first
      userSocket.on('startGame', function() {
        console.log('startGame');
        findLobby(function(foundLobby) {
          var newGameModel = new PubGameModel();
          foundLobby.gameModel = newGameModel;
          //Updates everyone's lobby data
          io.emit('newData', {lobbies:allLobbyGames});        
          //Removes this game from the lobby list (different from closing!)
          var lobbyIndex = allLobbyGames.indexOf(foundLobby);
          if(lobbyIndex > -1) allLobbyGames.splice(lobbyIndex, 1);
          newGameModel.startGame(foundLobby, function(newData) {
            newData.lobbyDisplay = false;
            newData.lobbyListDisplay = false;
            _.each(foundLobby.userIds, function(userIdInLobby) {
              allUsers[userIdInLobby].socket.emit('newData', newData);
            });
          });
        });
      });

      //////////////////////////////////////////
      /// In game actions
      //////////////////////////////////////////

      userSocket.on('answer', function(data) {
        console.log('answer');
        var relevantGame = allGames[allUsers[userId].gameId];
        relevantGame.registerAnswer(data, userId, callback);

        //eventually, only emit to people in this room
        io.emit('newData', newDataObject)
      });

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