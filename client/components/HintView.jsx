var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div className="hint-view">
        Your hint is: {this.props.hint}
        <br/>
        This hint is for: {this.props.hintUser}
      </div>
    )
  }
});
