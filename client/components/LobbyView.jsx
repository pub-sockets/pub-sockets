var React = require('react');

module.exports = React.createClass({
  render: function() {
    //shows all the users in the lobby
    //game start button
    //back button
    return (
      <div>
        <div>
          Your name: {this.props.username}
        </div>
        <div id={"LobbyView"}>
          {this.renderUsersIfTheyExist()}
        </div>
        <div>
          <button id={"StartGameButton"} onClick={this.startGame}>
           Start game!
          </button>
        </div>
        <div>
          <button id={"RemoveLobbyButton"}>
            Remove this lobby (not working yet)
          </button>
        </div>
        <div>
          <button id={"BackButton"} onClick={this.props.displayLobbyList}>
            Back
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
          <button id={"CloseLobbyButton"} onClick={}
        </div>
        )
    } else {
      return()
    }
  },
  
  startGame: function() {
    //no arguments: the server knows which game you're in already
    require('../ClientSocketManager.js').startGame();
  }
});
