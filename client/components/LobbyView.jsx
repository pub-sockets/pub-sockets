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
          {this.renderButtons()}
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
      if(this.props.lobby.users.length > 3 && this.props.lobby.users.length%2 === 0) {
        return(
          <div>
            <div>
              <button id={"start-game-button"} onClick={this.startSingleTeamGame}>
               Start cooperative game!
              </button>
            </div>
            <div>
              <button id={"start-game-button"} onClick={this.startMultipleTeamGame}>
               Start team game! (Not working yet)
              </button>
            </div>
            <div>
              <button id={"open-lobby-button"} onClick={this.openGameLobby}>
                Open lobby
              </button>
            </div>
          </div>
        )
      } else if(this.props.lobby.users.length > 1) {      
        return(
          <div>
            <div>
              <button id={"start-game-button"} onClick={this.startSingleTeamGame}>
               Start cooperative game!
              </button>
            </div>
            <div>
              <button id={"open-lobby-button"} onClick={this.openGameLobby}>
                Open lobby
              </button>
            </div>
          </div>
          )
      }
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
  startSingleTeamGame: function() {
    clientSocket.startSingleTeamGame();
  },
  startMultipleTeamGame: function() {
    clientSocket.startMultipleTeamGame();
  },
  openGameLobby: function() {
    clientSocket.openGameLobby();
  },
  closeGameLobby: function() {
    clientSocket.closeGameLobby();
  },
  removeGameLobby: function() {
    clientSocket.removeGameLobby();
  }
});
