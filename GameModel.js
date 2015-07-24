var db = require('./db/DatabaseManager.js');
var _ = require('underscore');

var PubGameModel = function() {
  this.answeredQuestions = {};
  this.hostTeamExtraTime = 30;
  this.notHostTeamExtraTime = 30;
  this.hostTeamScore = 0;
  this.notHostTeamScore = 0;
  this.gameStarted = false;
  this.singleTeamGame = true;

  this.userIds = [];

  this.userObjects = [];
  //in game user info: tracks question id, hint ids
}

PubGameModel.prototype.startSingleTeamGame = function(lobbyData, callback) {
  console.log('lobbyData');
  console.log(lobbyData);

  var that = this;
  that.userIds = lobbyData.userIds;
  lobbyData.usersInfo = that.userIds;
  that.singleTeamGame = true;
  that.gameStarted = true;
  
  _.each(that.userIds, function(id) {
    //in multiple teams function, that is where teams would be assigned
    that.userObjects.push({questionUserId: id});
  });

  _.each(that.userIds, function(id) {
    var newQuestionData = db.fetchNewQuestion();

    var questionUserIndex = -1;
    var workingUserObject = null;
    for(var i = 0; i < that.userObjects.length; i++) {
      if(that.userObjects[i].question === undefined) {
        questionUserIndex = i;
        workingUserObject = that.userObjects[i];
        break;
      }
    }

    workingUserObject.question = newQuestionData.question;
    workingUserObject.answers = newQuestionData.answers;
    workingUserObject.questionId = newQuestionData.id;
    workingUserObject.correctIndex = newQuestionData.correctIndex-1;

    // sets hint 1 
    var workingHintUserObject = _.find(that.userObjects, function(hinterObj) {
      return (hinterObj.hint1User === undefined);
      // return (hinterObj.hint1Id === newQuestionData.id);
    });
    workingHintUserObject.hint1 = newQuestionData.hint1;
    workingHintUserObject.hint1User = lobbyData.users[questionUserIndex];

    // sets hint 2
    var workingHintUserObject = _.find(that.userObjects, function(hinterObj) {
      return (hinterObj.hint2User === undefined);
      // return (hinterObj.hint2Id === newQuestionData.id);
    });
    workingHintUserObject.hint2 = newQuestionData.hint2;
    workingHintUserObject.hint2User = lobbyData.users[questionUserIndex];
  });

  _.each(that.userObjects, function(userObject) {
    that.decorateWithGameData(userObject);
    userObject.lobbyDisplay = false;
    userObject.lobbyListDisplay = false;

    callback(userObject.questionUserId, userObject);
  });
};

PubGameModel.prototype.startMultipleTeamGame = function(lobbyData, callback) {

};



PubGameModel.prototype.registerAnswer = function(data, userId, callback) {
  this.answeredQuestions[data.id] = true;

  data.changingUserSocket = userId;

  this.hostTeamExtraTime += 5;

  var newData;

  callback(newData);
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
