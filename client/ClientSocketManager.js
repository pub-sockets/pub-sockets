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
  startGame: function() {
    socketServer.emit('startGame');
  },
  closeLobby: function() {
    socketServer.emit('closeLobby');
  },
  openLobby: function() {
    socketServer.emit('openLobby');
  },


  /////////////////////////////////////
  /// Event emitters: in game actions
  /////////////////////////////////////


  answer: function(emittingAnswer, correct, questionId) {
    console.log('answer was emitted: ' + emittingAnswer);
    socketServer.emit('answer', { answer : emittingAnswer, 
                                  correct: correct,
                                  questionId: questionId });
  },
  gameEnd: function() {
    socketServer.emit('gameEnd');
  },
}
