var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div className="users-view">
        Users info: {this.props.usersInfo}
      </div>
    )
  }
});
