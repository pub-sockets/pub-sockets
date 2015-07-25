var React = require('react');
var sockets = require('../ClientSocketManager.js');

module.exports = React.createClass({
  clickHandler : function() {
    console.log('clicked');

    console.log(this.props.answerHandler);
    
    this.props.answerHandler(this.props.correct);

    sockets.answer(this.props.correct);
  },
  render: function() {
    var numToLetter = {0:'A',1:'B',2:'C',3:'D'};
    return (
      <li onClick={this.clickHandler}>
        {numToLetter[this.props.index]} : {this.props.answer}
      </li>
    )
  }
});