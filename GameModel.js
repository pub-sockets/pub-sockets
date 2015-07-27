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

  this.hostTeamUserObjects = [];
  this.notHostTeamUserObjects = [];
  this.hostTeamQuestionQueue = [];
  this.notHostTeamQuestionQueue = [];
  //in game user info: tracks question id, hint ids
}

PubGameModel.prototype.startGame = function(lobbyData, singleTeam, callback) {

  var that = this;
  that.userIds = lobbyData.userIds;
  lobbyData.usersInfo = that.userIds;
  that.singleTeamGame = singleTeam;
  that.gameStarted = true;
  
  _.each(that.userIds, function(id) {
    //in multiple teams function, that is where teams would be assigned
    that.userObjects.push({
      id: id, 
      username: lobbyData.users[lobbyData.userIds.indexOf(id)]
    });
  });

  var teams = [];
  if(this.singleTeamGame) {
    teams.push(that.userObjects);
    for(var i = 0; i < that.userObjects.length; i++) {
      this.hostTeamQuestionQueue.push(that.userObjects[i]);
    }
  } else {
    for(var i = 0; i < that.userObjects.length; i++) {
      if(i < that.userObjects.length/2) {
        this.hostTeamUserObjects.push(that.userObjects[i]);
        this.hostTeamQuestionQueue.push(that.userObjects[i]);
      } else {
        this.notHostTeamUserObjects.push(that.userObjects[i]);
        this.notHostTeamQuestionQueue.push(that.userObjects[i]);
      }
    }
    teams.push(this.hostTeamUserObjects);
    teams.push(this.notHostTeamUserObjects);
  }



  var currentTeamQuestionQueue = that.hostTeamQuestionQueue;
  while(teams.length > 0) {
    var thisTeam = teams.shift();

    for(var i = 0; i < thisTeam.length; i++) {

      var len = thisTeam.length;

      var newQuestionData = db.fetchNewQuestion();

      thisTeam[i].question = newQuestionData.question;
      thisTeam[i].answers = newQuestionData.answers;
      thisTeam[i].questionId = newQuestionData.id;
      thisTeam[i].correctIndex = newQuestionData.correctIndex-1;
      thisTeam[i].singleTeamGame = singleTeam;

      var idx1;
      var idx2;
      if(len === 2) {
        idx1 = (i===0) ? 1 : 0;
        idx2 = idx1;
      } else {
        idx1 = (i+1)%len;
        idx2 = (i+2)%len;
      } 

      thisTeam[idx1].hint1 = newQuestionData.hint1;
      thisTeam[idx1].hint1User = thisTeam[i].username;
      thisTeam[idx2].hint2 = newQuestionData.hint2;
      thisTeam[idx2].hint2User = thisTeam[i].username;

      if(teams.length > 0) currentTeamQuestionQueue = that.notHostTeamQuestionQueue;
    }

    _.each(thisTeam, function(userObject) {
      that.decorateWithGameData(userObject);
      userObject.lobbyDisplay = false;
      userObject.lobbyListDisplay = false;

      callback(userObject.id, userObject);
    });
  }
}

PubGameModel.prototype.startSingleTeamGame = function(lobbyData, callback) {
  this.startGame(lobbyData, true, callback);
}

PubGameModel.prototype.startMultipleTeamGame = function(lobbyData, callback) {
  this.startGame(lobbyData, false, callback);
};



PubGameModel.prototype.registerAnswer = function(lobbyData, userId, correct, callback) {

  var answererIsOnHostTeam = true;
  if(this.singleTeamGame) {  
    if(correct) {
      this.hostTeamExtraTime += 5;
      this.hostTeamScore++;    
    }
    console.log('singleteamgame');
    console.log(answererIsOnHostTeam);
  } else {
    var appropriateTeam;
    that = this;
    if(!!_.find(that.hostTeamUserObjects, 
      function(hostObj) {return hostObj.id === userId})){
      if(correct) {
        this.hostTeamExtraTime += 5;
        this.hostTeamScore++;
      }
      console.log('answererIsOnHostTeam');
      console.log(answererIsOnHostTeam);
    } else {
      if(correct) {
        this.notHostTeamExtraTime += 5;
        this.notHostTeamScore++;
      }
      answererIsOnHostTeam = false;
      console.log('answererIs NOT OnHostTeam');
      console.log(answererIsOnHostTeam);
    }
  }

  var that = this;

  var newQuestionData = db.fetchNewQuestion();

  var userToGetQuestion = _.find(that.userObjects, function(userObj) {
    return userObj.id === userId;
  });

  userToGetQuestion.question = newQuestionData.question;
  userToGetQuestion.answers = newQuestionData.answers;
  userToGetQuestion.questionId = newQuestionData.id;
  userToGetQuestion.correctIndex = newQuestionData.correctIndex-1;

  var appropriateQuestionQueue =  
    (answererIsOnHostTeam) ? this.hostTeamQuestionQueue : this.notHostTeamQuestionQueue;
  console.log(appropriateQuestionQueue);

  // sets hint 1 
  var workingHintUserObject = appropriateQuestionQueue.shift();
  appropriateQuestionQueue.push(workingHintUserObject);
  if(workingHintUserObject.username === userToGetQuestion.username) {
    workingHintUserObject = appropriateQuestionQueue.shift();
    appropriateQuestionQueue.push(workingHintUserObject);
  }
  workingHintUserObject.hint1 = newQuestionData.hint1;
  workingHintUserObject.hint1User = userToGetQuestion.username;

  // sets hint 2
  var workingHintUserObject = appropriateQuestionQueue.shift();
  appropriateQuestionQueue.push(workingHintUserObject);
  if(workingHintUserObject.username === userToGetQuestion.username) {
    workingHintUserObject = appropriateQuestionQueue.shift();
    appropriateQuestionQueue.push(workingHintUserObject);
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

PubGameModel.prototype.decorateWithGameData = function(data) {
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
    var that = this;
    data.onHostTeam = !!_.find(that.hostTeamUserObjects, 
      function(hostObj) {return hostObj.id === data.id});
  }
};

PubGameModel.prototype.endGame = function(callback) {
  var winner = "your team"
  callback(winner+" wins!");
};

module.exports = PubGameModel;
