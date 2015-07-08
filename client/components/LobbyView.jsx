var React = require('react');
var clientSocket = require('../ClientSocketManager.js');

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <div>
          Your name: {this.props.username}
        </div>
        <div id={"lobby-view"}>
          {this.renderUsersIfTheyExist()}
        </div>
        <div id={"lobby-buttons"}>
          buttons: {this.renderButtons()}
        </div>
        <div>
          <button id={"remove-lobby-button"} onClick={this.removeGameLobby}>
            Remove this lobby
          </button>
        </div>
        <div>
          <button id={"BackButton"} onClick={this.props.displayLobbyList}>
            Go back
          </button>
        </div>
      </div>
    )
  },
  renderUsersIfTheyExist: function() {
    if(!this.props || !this.props.lobby) {
      return (<div></div>)
    } else {
      return(this.props.lobby.users.map(function(user, index){
          return(<div>Player {index+1}: {user}</div>)
      }))
    }
  },
  renderButtons: function() {
    if(!this.props || !this.props.lobby) {
      return (<div></div>)
    } else if(this.props.lobby.closed) {
      return(
        <div>
          <div>
            <button id={"open-lobby-button"} onClick={this.openGameLobby}>
              Open lobby
            </button>
          </div>
          <div>
            <button id={"start-game-button"} onClick={this.startGame}>
             Start game!
            </button>
          </div>
        </div>
        )
    } else {
      return(
        <div>
          <div>
            <button id={"close-lobby-button"} onClick={this.closeGameLobby}>
              Close lobby
            </button>
          </div>
        </div>
      )
    }
  },
  startGame: function() {
    clientSocket.startGame();
  },
  openGameLobby: function() {
    clientSocket.openGameLobby();
  },
  closeGameLobby: function() {
    console.log('woops');
    console.log('aaaa');
    clientSocket.closeGameLobby();
  },
  removeGameLobby: function() {
    clientSocket.removeGameLobby();
  }
});
