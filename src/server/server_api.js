  const fs = require('fs');
const mesg = require('../messages/messages');

const STATE_BACKUP_FPATH = 'state.json';

exports = module.exports = {};

const debug = true;

function createMessages() {
  return { users: [], admins: [], pollUsers: [], toSender: [] };
}

function createAllUpdates(ret, round, state, introOutro) {
  ret.users.push(mesg.buildUserUpdate(round, state, introOutro));
  ret.admins.push(mesg.buildAdminUpdate(round, state));
  ret.pollUsers.push(mesg.buildPollUserUpdate(round, state));
  return ret;
}

function calcPollCounts(pollChoices, answerLen) {
  const res = {};
  for (let i = 0; i < answerLen; i++) {
    res[i] = 0;
  }
  const values = Object.values(pollChoices);
  for (let i = 0; i < values.length; i++) {
    res[values[i]] += 1;
  }
  return res;
}

// FIXME: SHITTY FUNCTION
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

function findMaxKey(obj) {
  const keys = Object.keys(obj);
  const len = keys.length;
  let maxKey = 0;
  let maxValue = -1;
  for (let i = 0; i < len; i++) {
    const key = keys[i];
    const value = obj[key];
    if (value > maxValue) {
      maxKey = key;
      maxValue = value;
    }
  }
  return maxKey;
}

function checkConsistency(res, state) {
  let txt = '';
  if (res.round !== state.round) {
    txt = 'ERR: Inconsistent round (sender) ' + res.round + ' != (backend) ' + state.round;
  }
  if (res.qid !== state.qid) {
    txt = 'ERR: Inconsistent qid (sender) ' + res.qid + ' != (backend) ' + state.qid;
  }
  if (state.qid >= state.maxQid) {
    throw 'ERR: qid is to high';
  }
  return txt;
}

function createRoundJokerState() {
  return {
    audience: -1,
    fifty: -1,
    telephone: -1
  };
}
function createRoundResultState() {
  return {
    locked: {},
    chosen: {},
    correct: {},
    disabledAnswers: {},
  };
}

function createBackendState() {
  if (fs.existsSync(STATE_BACKUP_FPATH)) {
    console.log('-read state from json-');
    const inputStr = fs.readFileSync(STATE_BACKUP_FPATH, 'utf8');
    const state = JSON.parse(inputStr);
    return state;
  }
  return {
    qid: 0,
    round: 0,
    bank: 0,
    oldBank: 0,
    result: { 0: createRoundResultState() },
    joker: { 0: createRoundJokerState() },
    pollUsers: { bank: {}, chosen: { 0: {} }, names: {} },
    showIntro: false,
    gameStarted: false,
    gameFinished: false,
  };
}

function stateWrite(state) {
  fs.writeFile(STATE_BACKUP_FPATH, JSON.stringify(state), 'utf8', (err) => {
    if (err) throw err;
    console.log('-state backup-');
  });
}

function statePrev(state, rounds) {
  if (state.showIntro) {
    // we want to ignore intro's when going backwards
    state.showIntro = false;
  }
  if (state.qid === 0 && state.round > 0) {
    state.round = state.round - 1;
    state.qid = rounds[state.round].questions.length - 1;
  } else {
    state.qid = state.qid - 1;
  }
  return state;
}

function stateNext(state, rounds) {
  const maxRound = rounds.length;
  const maxQid = rounds[state.round].questions.length;
  const thisRound = rounds[state.round];

  // set new state
  state.oldBank = state.bank;

  if (!state.gameStarted) {
    state.gameStarted = true;
    console.log('Game START');
    if ('intro' in thisRound) {
      state.showIntro = true;
    }
  } else if (state.qid === 0 && state.showIntro) {
    // AFTER first question IF it has an intro (intro has already been played)
    state.showIntro = false;
  } else if ((state.round === maxRound - 1) && (state.qid === maxQid - 1)) {
    // AFTER last question AND last round
    console.log('Game END');
    state.gameFinished = true;
  } else if (state.qid === maxQid - 1) {
    // AFTER last question AND NOT last round
    console.log('Round ' + state.round + '/' + maxRound);
    state.round += state.round + 1;
    state.pollUsers.chosen[state.round] = {};
    if (!(state.round in state.result)) {
      state.result[state.round] = createRoundResultState();
    }
    if (!(state.round in state.joker)) {
      state.joker[state.round] = createRoundJokerState();
    }
    state.qid = 0;
    state.showIntro = 'intro' in thisRound;
  } else {
    // AFTER (first question) AND (before last question)
    console.log('Question ' + state.qid + '/' + maxQid);
    state.qid = state.qid + 1;
  }
}

function recvMsgLockIn(inMsg, state, rounds, introOutro) {
  const ret = createMessages();
  const thisRound = rounds[state.round];
  const thisQuestion = rounds[state.round].questions[state.qid];
  const thisRoundResult = state.result[state.round];
  // check
  const txt = checkConsistency(inMsg, state);
  if (txt.length > 0) {
    ret.admins.push(mesg.buildWarning(state, txt));
    return ret;
  }
  if ((inMsg.qid in thisRoundResult.locked)
    && (thisRoundResult.locked[state.qid])) {
    ret.admins.push(mesg.buildWarning(state, 'Question already locked!'));
    return ret;
  }
  if ((inMsg.qid in thisRoundResult.chosen)
    && (thisRoundResult.chosen[inMsg.qid] !== inMsg.solution.chosen)) {
    ret.admins.push(
      mesg.buildAdminUpdate(rounds[inMsg.round], state),
    );
    ret.admins.push(
      mesg.buildWarning(state, 'Question already has different answer!')
    );
    return ret;
  }
  if (((inMsg.solution.chosen === -1) || (!(state.qid in thisRoundResult.chosen)))
    && !state.showIntro && state.gameStarted
    && state.joker[state.round].audience !== state.qid
  ) {
    ret.admins.push(
      mesg.buildWarning(state, 'Please wait for the choice of the user!')
    );
    return ret;
  }
  if (!state.gameStarted) {
    ret.admins.push(
      mesg.buildWarning(state, 'Please wait for the game to start!')
    );
  }
  // logic
  thisRoundResult.locked[inMsg.qid] = true;
  thisRoundResult.correct[inMsg.qid] = thisQuestion.solution.correct;

  let audienceAnswer = 0;
  if (state.qid in state.pollUsers.chosen[state.round]) {
    const pollChoices = state.pollUsers.chosen[state.round][state.qid];
    if (!isEmpty(pollChoices) && Object.keys(pollChoices).length > 0) {
      const answerLen = thisQuestion.answers.length;
      const pollCounts = calcPollCounts(pollChoices, answerLen);
      audienceAnswer = Number(findMaxKey(pollCounts));
    }
  }
  if (state.joker[state.round].audience === state.qid) {
    console.log('AUDIENCE JOKER USED');
    thisRoundResult.chosen[inMsg.qid] = audienceAnswer;
  }
  if (thisRound.type === 'reverse') {
    thisRoundResult.correct[inMsg.qid] = audienceAnswer;
  }
  console.log(thisRound.type, thisRoundResult.chosen[inMsg.qid], audienceAnswer);
  console.log('correct ', audienceAnswer, thisRoundResult.correct[inMsg.qid]);
  if (thisRoundResult.chosen[inMsg.qid] === thisRoundResult.correct[inMsg.qid]) {
    state.oldBank = state.bank;
    state.bank = state.bank + thisRound.price;
    console.log(state.bank, state.oldBank, thisRound.price);
  }
  Object.keys(state.pollUsers.bank).forEach((uid) => {
    if (
      (state.round in state.pollUsers.chosen)
      && (state.qid in state.pollUsers.chosen[state.round])
      && (uid in state.pollUsers.chosen[state.round][state.qid])
      && (state.pollUsers.chosen[state.round][state.qid][uid] === thisRoundResult.correct[state.qid])
    ) {
      state.pollUsers.bank[uid] += thisRound.price;
    }
  });
  return createAllUpdates(ret, rounds[state.round], state, introOutro);
}

function recvMsgPollUserInit(inMsg, state, rounds, introOutro) {
  const ret = createMessages();
  if (inMsg.uid in state.pollUsers.bank) {
    // pollUser is already registered
    return ret;
  }
  state.pollUsers.bank[inMsg.uid] = 0;
  state.pollUsers.names[inMsg.uid] = inMsg.name;
  ret.toSender.push(mesg.buildPollUserUpdate(rounds[state.round], state));
  return ret;
}

function recvMsgPollUserChoice(inMsg, state, rounds, introOutro) {
  const ret = createMessages();
  if ((inMsg.qid in state.result[inMsg.round].locked)
    && (state.result[inMsg.round].locked[inMsg.qid])) {
    ret.pollUsers.push(mesg.buildWarning(state, 'Question already locked!'));
    return ret;
  }
  if (!(inMsg.uid in state.pollUsers.bank)) {
    ret.pollUsers.push(mesg.buildWarning(state, 'User is not registered. Please reload!'));
    return ret;
  }
  if (!(state.round in state.pollUsers.chosen)) {
    state.pollUsers.chosen[state.round] = {};
  }
  if (!(state.qid in state.pollUsers.chosen[state.round])) {
    state.pollUsers.chosen[state.round][state.qid] = {};
  }
  state.pollUsers.chosen[state.round][state.qid][inMsg.uid] = inMsg.answer;
  ret.toSender.push(mesg.buildPollUserUpdate(rounds[state.round], state));
  return ret;
}

function recvMsgJoker(inMsg, state, rounds, introOutro) {
  const ret = createMessages();
  // check
  const txt = checkConsistency(inMsg, state);
  if (txt.length > 0) {
    ret.users.push(mesg.buildWarning(state, txt));
    return ret;
  }
  if (state.joker[inMsg.round][inMsg.joker] > -1) {
    ret.users.push(mesg.buildWarning(state, 'Joker already used!'));
    return ret;
  }
  if ((inMsg.qid in state.result[inMsg.round].locked)
    && (state.result[inMsg.round].locked[inMsg.qid])) {
    ret.users.push(mesg.buildWarning(state, 'Nice try! You cannot use a joker if the question is already locked.'));
    return ret;
  }
  if (!(inMsg.joker in state.joker[state.round])) {
    ret.users.push(mesg.buildWarning(state, 'You used an invalid joker!'));
    return ret;
  }
  if (state.joker[inMsg.round][inMsg.joker] === state.qid) {
    ret.users.push(mesg.buildWarning(state, 'No double-playing of jokers!'));
    return ret;
  }
  // logic
  state.joker[inMsg.round][inMsg.joker] = state.qid;
  const thisQuestion = rounds[state.round].questions[state.qid];
  if (state.joker[state.round].fifty === state.qid) {
    const answerLen = thisQuestion.answers.length;
    const set = new Set([...Array(answerLen).keys()]);
    set.delete(thisQuestion.solution.correct);
    const arr = Array.from(set);
    const randomChoices = new Set();
    while (randomChoices.size < answerLen / 2) {
      const num = Math.floor(Math.random() * (answerLen - 1));
      const choice = arr[num];
      if (!(randomChoices.has(choice))) {
        randomChoices.add(choice);
      }
    }
    state.result[state.round].disabledAnswers[state.qid] = Array.from(randomChoices);
  }
  // reset choice
  state.result[inMsg.round].chosen[state.qid] = -1;
  return createAllUpdates(ret, rounds[state.round], state, introOutro);
}

function recvMsgUnlock(inMsg, state, rounds, introOutro) {
  // FIXME: This does not reset already achieved winnings
  const ret = createMessages();
  // check
  const txt = checkConsistency(inMsg, state);
  if (txt.length > 0) {
    ret.admins.push(mesg.buildWarning(state, txt));
    return ret;
  }

  if ((inMsg.qid in state.result[inMsg.round].locked)
    && (state.result[inMsg.round].locked[inMsg.qid])) {
    state.result[state.round].chosen[state.qid] = -1;
    delete state.result[state.round].locked[state.qid];
  }
  return createAllUpdates(ret, rounds[state.round], state, introOutro);
}

// WARN mutates state of 'state'
function recvMsgPrev(inMsg, state, rounds, introOutro) {
  const ret = createMessages();
  // check
  const txt = checkConsistency(inMsg, state);
  if (txt.length > 0) {
    ret.admins.push(mesg.buildWarning(state, txt));
    return ret;
  }
  // logic
  state = statePrev(state, rounds);
  return createAllUpdates(ret, rounds[state.round], state, introOutro);
}

function recvMsgNext(inMsg, state, rounds, introOutro) {
  const ret = createMessages();
  // check
  const txt = checkConsistency(inMsg, state);
  if (txt.length > 0) {
    ret.admins.push(mesg.buildWarning(state, txt));
    return ret;
  }
  if ((!(state.qid in state.result[state.round].chosen))
    && !state.showIntro
    && state.gameStarted
    && !inMsg.override) {
    ret.admins.push(mesg.buildWarning(state, 'Please wait for the choice of the user!'));
    return ret;
  }
  if (!(state.qid in state.result[state.round].locked)
    && !state.result[state.round].locked[state.qid]
    && !inMsg.override
    && state.gameStarted
    && !state.showIntro
  ) {
    ret.admins.push(mesg.buildWarning(state, 'First lock!'));
    return ret;
  }

  // logic
  stateNext(state, rounds);
  return createAllUpdates(ret, rounds[state.round], state, introOutro);
}

function recvMsgChoice(inMsg, state, rounds, introOutro) {
  const ret = createMessages();
  // check
  const txt = checkConsistency(inMsg, state);
  if (txt.length > 0) {
    ret.users.push(mesg.buildWarning(state, txt));
    return ret;
  }
  if ((inMsg.qid in state.result[inMsg.round].locked)
    && (state.result[inMsg.round].locked[inMsg.qid])) {
    ret.users.push(mesg.buildWarning(state, 'Question already locked!'));
    return ret;
  }
  state.result[inMsg.round].chosen[inMsg.qid] = inMsg.solution.chosen;
  // logic
  return createAllUpdates(ret, rounds[state.round], state, introOutro);
}

function initServer(io, rounds, introOutro) {
  const state = createBackendState();
  const admins = io.of('/adminNsp');
  const users = io.of('/userNsp');
  const pollUsers = io.of('/pollNsp');

  const sendMsg = (nsp, nspName, msg) => {
    console.log('-> ' + msg.key + ' (' + nspName + ')');
    if (debug) console.log(msg.value);
    nsp.emit(msg.key, msg.value);
  };
  const adminSend = msg => sendMsg(admins, 'admins', msg);
  const userSend = msg => sendMsg(users, 'users', msg);
  const pollUserSend = msg => sendMsg(pollUsers, 'pollUsers', msg);
  const replyToSender = (msg, socket) => {
    console.log('-> ' + msg.key + ' (toSender)');
    socket.emit(msg.key, msg.value);
  };
  const send = (msgs, socket) => {
    msgs.admins.forEach(msg => adminSend(msg));
    msgs.users.forEach(msg => userSend(msg));
    msgs.pollUsers.forEach(msg => pollUserSend(msg));
    msgs.toSender.forEach(msg => replyToSender(msg, socket));
  };

  users.on('connect', (socket) => {
    console.log('A wild user appears');
    const thisRound = rounds[state.round];
    userSend(mesg.buildUserUpdate(thisRound, state, introOutro));

    socket.on(mesg.msgChoice, (inMsg) => {
      console.log('<- Choice');
      if (debug) console.log(inMsg);
      const data = recvMsgChoice(inMsg, state, rounds, introOutro);
      send(data);
    });
    socket.on(mesg.msgJoker, (inMsg) => {
      console.log('<- Joker');
      if (debug) console.log(inMsg);
      const data = recvMsgJoker(inMsg, state, rounds, introOutro);
      send(data);
    });
  });

  admins.on('connect', (socket) => {
    console.log('A wild admins appears');
    const thisRound = rounds[state.round];
    adminSend(mesg.buildAdminUpdate(thisRound, state));

    socket.on(mesg.msgLockIn, (inMsg) => {
      console.log('<- LockIn');
      if (debug) console.log(inMsg);
      const data = recvMsgLockIn(inMsg, state, rounds, introOutro);
      stateWrite(state);
      send(data, socket);
    });
    socket.on(mesg.msgPrev, (inMsg) => {
      console.log('<- Prev');
      if (debug) console.log(inMsg);
      const data = recvMsgPrev(inMsg, state, rounds, introOutro);
      stateWrite(state);
      send(data, socket);
    });
    socket.on(mesg.msgUnlock, (inMsg) => {
      console.log('<- Unlock');
      if (debug) console.log(inMsg);
      const data = recvMsgUnlock(inMsg, state, rounds, introOutro);
      stateWrite(state);
      send(data, socket);
    });
    socket.on(mesg.msgNext, (inMsg) => {
      console.log('<- Next');
      if (debug) console.log(inMsg);
      const data = recvMsgNext(inMsg, state, rounds, introOutro);
      stateWrite(state);
      send(data, socket);
    });
  });
  pollUsers.on('connect', (socket) => {
    socket.on(mesg.msgPollUserInit, (inMsg) => {
      const data = recvMsgPollUserInit(inMsg, state, rounds, introOutro);
      send(data, socket);
    });
    socket.on(mesg.msgPollUserChoice, (inMsg) => {
      const data = recvMsgPollUserChoice(inMsg, state, rounds, introOutro);
      send(data, socket);
    });
  });
}

exports.initServer = initServer;
