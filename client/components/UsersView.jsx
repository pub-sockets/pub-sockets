var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div className="users-view">
        You are: {this.props.username}
        <br/>
        Your team is: {this.renderTeamName()}
      </div>
    )
  },
  renderTeamName: function() {
  	return this.props.onHostTeam ? (<div>Alpha team</div>) : (<div>Bravo team</div>);
  }
});
