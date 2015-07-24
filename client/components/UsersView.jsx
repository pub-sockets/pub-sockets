var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div className="users-view">
        You are: {this.props.username}
      </div>
    )
  }
});
