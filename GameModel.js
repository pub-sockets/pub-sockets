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

  this.nextQuestionQueue = [];
  //in game user info: tracks question id, hint ids
}

PubGameModel.prototype.startSingleTeamGame = function(lobbyData, callback) {

  var that = this;
  that.userIds = lobbyData.userIds;
  lobbyData.usersInfo = that.userIds;
  that.singleTeamGame = true;
  that.gameStarted = true;
  
  _.each(that.userIds, function(id) {
    //in multiple teams function, that is where teams would be assigned
    that.userObjects.push({
      id: id, 
      username: lobbyData.users[lobbyData.userIds.indexOf(id)]
    });
    that.nextQuestionQueue.push(that.userObjects[that.userObjects.length-1]);
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
      return (hinterObj.hint1User === undefined && 
              hinterObj.id !== workingUserObject.id);
      // return (hinterObj.hint1Id === newQuestionData.id);
    });
    workingHintUserObject.hint1 = newQuestionData.hint1;
    workingHintUserObject.hint1User = lobbyData.users[questionUserIndex];

    // sets hint 2
    var workingHintUserObject = _.find(that.userObjects, function(hinterObj) {
      return (hinterObj.hint2User === undefined && 
              hinterObj.id !== workingUserObject.id);
      // return (hinterObj.hint2Id === newQuestionData.id);
    });
    workingHintUserObject.hint2 = newQuestionData.hint2;
    workingHintUserObject.hint2User = lobbyData.users[questionUserIndex];
  });

  _.each(that.userObjects, function(userObject) {
    that.decorateWithGameData(userObject);
    userObject.lobbyDisplay = false;
    userObject.lobbyListDisplay = false;

    callback(userObject.id, userObject);
  });
};

PubGameModel.prototype.startMultipleTeamGame = function(lobbyData, callback) {

};



PubGameModel.prototype.registerAnswer = function(lobbyData, userId, correct, callback) {
  var that = this;

  var newQuestionData = db.fetchNewQuestion();

  var userToGetQuestion = _.find(that.userObjects, function(userObj) {
    return userObj.id === userId;
  })

  userToGetQuestion.question = newQuestionData.question;
  userToGetQuestion.answers = newQuestionData.answers;
  userToGetQuestion.questionId = newQuestionData.id;
  userToGetQuestion.correctIndex = newQuestionData.correctIndex-1;


  //is any of this correct? i don't know.
  // sets hint 1 
  var workingHintUserObject = that.nextQuestionQueue.shift();
  that.nextQuestionQueue.push(workingHintUserObject);
  console.log(workingHintUserObject);
  console.log(userToGetQuestion);
  if(workingHintUserObject.username === userToGetQuestion.username) {
    workingHintUserObject = that.nextQuestionQueue.shift();
    that.nextQuestionQueue.push(workingHintUserObject);
  }
  workingHintUserObject.hint1 = newQuestionData.hint1;
  workingHintUserObject.hint1User = userToGetQuestion.username;

  // sets hint 2
  var workingHintUserObject = that.nextQuestionQueue.shift();
  that.nextQuestionQueue.push(workingHintUserObject);
  if(workingHintUserObject.username === userToGetQuestion.username) {
    workingHintUserObject = that.nextQuestionQueue.shift();
    that.nextQuestionQueue.push(workingHintUserObject);
  }
  workingHintUserObject.hint2 = newQuestionData.hint2;
  workingHintUserObject.hint2User = userToGetQuestion.username;

  _.each(that.userObjects, function(userObject) {
    that.decorateWithGameData(userObject);
    userObject.lobbyDisplay = false;
    userObject.lobbyListDisplay = false;

    callback(userObject.id, userObject);
  });

  this.hostTeamExtraTime += 5;
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
