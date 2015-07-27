var React = require('react');

var HintView = require('./HintView.jsx');
var TimerView = require('./TimerView.jsx');
var QuestionView = require('./QuestionView.jsx');
var LobbyView = require('./LobbyView.jsx');
var LobbyListView = require('./LobbyListView.jsx');
var UsersView = require('./UsersView.jsx');

var socketInterface = require('../ClientSocketManager.js');

module.exports = React.createClass({
  getInitialState: function() {
    return  {
      username: "",
      question : "Loading!",
      answers : [],
      hint1 : '',
      hint2 : '',
      timeData : {},
      scoreData: {},
      gameStart : null,
      correctIndex: 0,
      questionId: 0,
      lobbies: ["Loading!"],
      lobbyDisplay: false,
      lobbyListDisplay: true,
      singleTeamGame: false,
      onHostTeam: true,
      gameHasEnded: false
    }
  },
  componentDidMount : function() {
    socketInterface.addNewDataListener(this.updateData);
  },
  updateData: function(data) {
    this.setState(data);
  },
  displayLobbyList: function(){
    this.setState({
      lobbyListDisplay: true,
      lobbyDisplay: false
    });
  },
  endGame: function() {
    this.setState({gameHasEnded: true});
  },
  render: function() {
    if (this.state.lobbyListDisplay) {
      //User is in the lobby list view
      return (<LobbyListView lobbies={this.state.lobbies} 
                             currentLobby={this.state.currentLobby}
                             username={this.state.username} />)
  //User is in the lobby view
    } else if (this.state.lobbyDisplay) {
    //User is in the lobby display view
      //iterates through all lobbies (yeah, i know)
      var yourLobby = null;
      for(var i = 0; i < this.state.lobbies.length; i++) {
        //if your userId is in a lobby, 
        if(!this.state.lobbies[i].userIds) continue;
        if(this.state.lobbies[i].users.indexOf(this.state.username) > -1){
          yourLobby = this.state.lobbies[i];
          break;
        }
      }
      return (<LobbyView lobby={yourLobby} 
                         username={this.state.username}
                         displayLobbyList={this.displayLobbyList} />)
    } else {
  //User is in the game view
      if (this.state.gameHasEnded) {
        if(this.state.singleTeamGame) {
          return (
            <div>
              Game over! <br/>
              Your score: {this.state.scoreData.hostTeamScore}
            </div>
          )
        } else {
          if(this.state.onHostTeam) {
            return (
              <div>
                Game over! <br/>
                Your score: {this.state.scoreData.hostTeamScore}<br/>
                Their score: {this.state.scoreData.notHostTeamScore}
              </div>
            )
          } else {
            return (
              <div>
                Game over! <br/>
                Your score: {this.state.scoreData.notHostTeamScore}
                Their score: {this.state.scoreData.hostTeamScore}
              </div>
            )
          }
        }
      } else {
        return (
          <div id="AppView">
            <HintView hint={this.state.hint1} hintUser={this.state.hint1User} />
            <HintView hint={this.state.hint2} hintUser={this.state.hint2User} />
            <TimerView time={this.state.timeData} 
                       gameStart={this.state.gameStart} 
                       scores={this.state.scoreData} 
                       singleTeamGame={this.state.singleTeamGame}
                       endGame={this.endGame}
                       onHostTeam={this.state.onHostTeam} />
            <QuestionView question={this.state.question} 
                          answers={this.state.answers}
                          correctIndex={this.state.correctIndex}
                          id={this.state.questionId}
                          gameHasEnded={this.state.gameHasEnded}
                          singleTeamGame={this.state.singleTeamGame}
                          onHostTeam={this.state.onHostTeam} />
            <UsersView username={this.state.username} 
                       onHostTeam={this.state.onHostTeam} />
          </div>
        )
      } 
    }
  }
});
