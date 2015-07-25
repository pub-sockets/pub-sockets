var React = require('react');
var AnswerEntryView = require('./AnswerEntryView.jsx');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      answerStatus: null
    }
  },
  answerRerender: function(answeredCorrect) {
    if(answeredCorrect) {
      this.setState({
          answerStatus: "right"
        }
      );
    } else {
      this.setState({
          answerStatus: "wrong"
        }
      );
    } 
    var that = this;
    setTimeout(function() {
      that.setState({answerStatus: null});
    }, 1000);
    this.render();
  },
  render: function(renderType) {

    //TODO: show the correct answer after you answer
    if(this.state.answerStatus === "wrong" ) {
      return (
        <div class="wrong">
          <br/>
          <b>WRONG</b>
          <br/>
        </div>
      )
    } else if(this.state.answerStatus === "right" ) {
      return (
        <div class="right">
          <br/>
          <b>RIGHT</b>
          <br/>
        </div>
      )
    } else {
      var correctIndex = this.props.correctIndex;
      var answerRerender = this.answerRerender;
      var questionId = this.props.questionId;
      return (
        <div id="questionView">
          <p>
            {this.props.question}
          </p>
          <ul>
            {this.props.answers.map(function(entry, index) {
              return (<AnswerEntryView answer={entry} 
                       index={index} 
                       correct={index===correctIndex}
                       answerHandler={answerRerender}
                       questionId={questionId} /> 
              )}    
            )}
          </ul>
        </div>
      )
    }
  }
});