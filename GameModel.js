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
  this.gameStartTime = new Date();

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

  for(var i = 0; i < that.userObjects.length; i++) {
    var len = that.userObjects.length;

    var newQuestionData = db.fetchNewQuestion();

    that.userObjects[i].question = newQuestionData.question;
    that.userObjects[i].answers = newQuestionData.answers;
    that.userObjects[i].questionId = newQuestionData.id;
    that.userObjects[i].correctIndex = newQuestionData.correctIndex-1;
    that.userObjects[i].singleTeamGame = true;

    var idx1;
    var idx2;
    if(len === 2) {
      idx1 = (i===0) ? 1 : 0;
      idx2 = idx1;
    } else {
      idx1 = (i+1)%len;
      idx2 = (i+2)%len;
    } 

    console.log(idx1);
    console.log(idx2);

    that.userObjects[idx1].hint1 = newQuestionData.hint1;
    that.userObjects[idx1].hint1User = lobbyData.users[i];
    that.userObjects[idx2].hint2 = newQuestionData.hint2;
    that.userObjects[idx2].hint2User = lobbyData.users[i];
  }

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

  if(correct) {
    if(this.singleTeamGame) {  
      this.hostTeamExtraTime += 5;
      this.hostTeamScore++;
    } else {
      //find the guy who answered, find what team they are on, and add points and time 
    }
  }  

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

};

PubGameModel.prototype.decorateWithGameData = function(data, userId) {
  console.log(this.gameStartTime);
  console.log(this.hostTeamExtraTime);
  data.timeData = {
    hostTeamExtraTime : this.hostTeamExtraTime + this.gameStartTime.getTime()/1000,
    notHostTeamExtraTime : this.notHostTeamExtraTime + this.gameStartTime.getTime()/1000
  };
  data.scoreData = {
    hostTeamScore : this.hostTeamScore,
    notHostTeamScore : this.notHostTeamScore
  };

  if(this.singleTeamGame) {
    data.onHostTeam = true;
  } else {
    //find out if this guy is on the host team or not
  }
};

PubGameModel.prototype.endGame = function(callback) {
  var winner = "your team"
  callback(winner+" wins!");
};

module.exports = PubGameModel;
