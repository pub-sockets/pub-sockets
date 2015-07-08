var socketServer = io.connect();

module.exports = {

  /////////////////////////////////////
  /// Event listeners
  /////////////////////////////////////


  addNewDataListener: function(listeningFunc) {
    //listeningFunc is (essentially) just this.setState(data)
    socketServer.on('newData', listeningFunc);
  },


  /////////////////////////////////////
  /// Event emitters: lobby actions
  /////////////////////////////////////


  newGameLobby: function() {
    socketServer.emit('newGameLobby');
  },
  joinGameLobby: function(lobby) {
    socketServer.emit('joinGameLobby', lobby);
  },
  leaveGameLobby: function(lobby) {
    socketServer.emit('leaveGameLobby');
  },
  startSingleTeamGame: function() {
    socketServer.emit('startSingleTeamGame');
  },
  startMultipleTeamGame: function() {
    socketServer.emit('startMultipleTeamGame');
  },
  closeGameLobby: function() {
    socketServer.emit('closeGameLobby');
  },
  openGameLobby: function() {
    socketServer.emit('openGameLobby');
  },
  removeGameLobby: function() {
    socketServer.emit('removeGameLobby');
  },


  /////////////////////////////////////
  /// Event emitters: in game actions
  /////////////////////////////////////


  answer: function(emittingAnswer, correct, questionId) {
    socketServer.emit('answer', { answer : emittingAnswer, 
                                  correct: correct,
                                  questionId: questionId });
  },
  gameEnd: function() {
    socketServer.emit('gameEnd');
  },
}
