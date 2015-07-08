var db = require('./db/DatabaseManager.js');

var PubGameModel = function() {
  this.answeredQuestions = {};
  this.hostTeamExtraTime = 30;
  this.notHostTeamExtraTime = 30;
  this.hostTeamScore = 0;
  this.notHostTeamScore = 0;
  this.gameStarted = false;

  this.userIds = [];
  //in game user info: tracks question id, hint ids
}

PubGameModel.prototype.startGame = function(gameData, callback) {
  this.userIds = gameData.userIds;

  //eventually will set up teams. for right now, all users are
  //on one team

  this.gameStarted = true;
  this.decorateWithNewQuestion(gameData);
  this.decorateWithGameData(gameData);
  gameData.usersInfo = this.userIds;

  //updates newData with a new question and hint for each player
    //make a function that figures out who to send stuff to and
    //returns newData based on that. then use it in registeranswer
    //as well
    //AS WELL

  callback(gameData);
};


PubGameModel.prototype.registerAnswer = function(data, userId, callback) {
  this.answeredQuestions[data.id] = true;

  data.changingUserSocket = userId;

  this.hostTeamExtraTime += 5;

  var newData;




  callback(newData);
};

PubGameModel.prototype.decorateWithNewQuestion = function(data) {
  var newQuestionData = db.fetchNewQuestion();
  data.question = newQuestionData.question;
  data.answers = newQuestionData.answers;
  data.correctIndex = newQuestionData.correctIndex-1;
  data.id = newQuestionData.id;
};

PubGameModel.prototype.decorateWithGameData = function(data, userId) {
  data.timeData = {
    hostTeamExtraTime : this.hostTeamExtraTime,
    notHostTeamExtraTime : this.notHostTeamExtraTime
  };
  data.scoreData = {
    hostTeamScore : this.hostTeamScore,
    notHostTeamScore : this.notHostTeamScore
  };
};

PubGameModel.prototype.endGame = function(callback) {
  var winner = "your team"
  callback(winner+" wins!");
};

module.exports = PubGameModel;
