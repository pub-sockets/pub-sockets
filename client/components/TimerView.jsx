var React = require('react');

module.exports = React.createClass({
  getInitialState: function() {
    setInterval(this.refreshTime, 250);
    return {
      yourSecondsLeft : 0,
      yourScore : 0,
      enemySecondsLeft : 0,
      enemyScore : 0,
      time: {
        hostTeamExtraTime: 30,
        notHostTeamExtraTime: 30
      }
    };
  },
  refreshTime: function() {
    if(this.props.gameHasEnded) return;
    var now = new Date();
    if(this.props.singleTeamGame) {    
      this.setState({
        yourSecondsLeft : Math.floor(((this.props.gameStart - now.getTime())/1000) + this.props.time.hostTeamExtraTime),
        enemySecondsLeft : 0,
        yourScore: this.props.scores.hostTeamScore,
        enemyScore: this.props.scores.notHostTeamScore
      })
      if(this.state.yourSecondsLeft < 1) {
        this.props.endGame();
      }
    } else {
      if(this.props.onHostTeam) {
        this.setState({
          yourSecondsLeft : Math.floor(((this.props.gameStart - now.getTime())/1000) + this.props.time.hostTeamExtraTime),
          enemySecondsLeft : Math.floor(((this.props.gameStart - now.getTime())/1000) + this.props.time.notHostTeamExtraTime),
          yourScore: this.props.scores.hostTeamScore,
          enemyScore: this.props.scores.notHostTeamScore
        });
      } else {
        this.setState({
          yourSecondsLeft : Math.floor(((this.props.gameStart - now.getTime())/1000) + this.props.time.notHostTeamExtraTime),
          enemySecondsLeft : Math.floor(((this.props.gameStart - now.getTime())/1000) + this.props.time.hostTeamExtraTime),
          yourScore: this.props.scores.notHostTeamScore,
          enemyScore: this.props.scores.hostTeamScore
        });
      }
      if(this.state.yourSecondsLeft < 1 && this.state.enemySecondsLeft < 1) {
        this.props.endGame();
      }
    }
  },
  render: function() {
    if(this.props.singleTeamGame) {
      return (
        <div className="timerView">
          <div className="timerViewQuarter">
            Your time: {this.state.yourSecondsLeft}
          </div> 
          <div className="timerViewQuarter">
            Your team score: {this.state.yourScore}   
          </div> 
        </div>
      )
    } else {
      return (
        <div className="timerView">
          <div className="timerViewQuarter">
            Your time: {this.state.yourSecondsLeft}
          </div> 
          <div className="timerViewQuarter">
            Your team score: {this.state.yourScore}   
          </div> 
          <div className="timerViewQuarter">
            Their time: {this.state.enemySecondsLeft}  
          </div> 
          <div className="timerViewQuarter">
            Their team score: {this.state.enemyScore}
          </div>
        </div>
      )
    }
  }
});
