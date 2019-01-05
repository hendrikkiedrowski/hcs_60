var exports = module.exports = {};

const msgUserUpdate = 'UserUpdate';
const msgAdminUpdate = 'AdminUpdate';
const msgWarning = 'Warning';
const msgQuestion = 'Question';
const msgJoker = 'Joker';
const msgChoice = 'Choice';
const msgForwardChoice = 'ForwardChoice';
const msgLockIn = 'LockIn';
const msgUnlock = 'Unlock';
const msgResult = 'Result';
const msgNext = 'Next';
const msgPrev = 'Prev';
const msgPollUserInit = 'PollUserInit';
const msgPollUserChoice = 'PollUserChoice';
const msgPollUserUpdate = 'PollUserUpdate';
exports.msgUserUpdate = msgUserUpdate;
exports.msgAdminUpdate = msgAdminUpdate;
exports.msgWarning = msgWarning;
exports.msgQuestion = msgQuestion;
exports.msgJoker = msgJoker;
exports.msgChoice = msgChoice;
exports.msgForwardChoice = msgForwardChoice;
exports.msgLockIn = msgLockIn;
exports.msgUnlock = msgUnlock;
exports.msgResult = msgResult;
exports.msgNext = msgNext;
exports.msgPrev = msgPrev;
exports.msgPollUserInit = msgPollUserInit;
exports.msgPollUserChoice = msgPollUserChoice;
exports.msgPollUserUpdate = msgPollUserUpdate;

function buildPollUserUpdate(round, state, introOutro) {
  const msg = { key: msgPollUserUpdate, value: {} };
  const thisQuestion = round.questions[state.qid];
  msg.value = {
    round: state.round,
    qid: state.qid,
    disabledAnswers: [false, false, false, false],
    solution: {
      correct: -1,
      locked: false,
    },
    question: { txt: 'SHOWING OVERLAY!', img: '' },
    answers: ['', '', '', ''],
    warn: '',
    pollUsers: { bank: {}, chosen: {} }
  };
  if (state.gameStarted && !state.gameFinished && !state.showIntro) {
    msg.value.question = thisQuestion.question;
    msg.value.answers = thisQuestion.answers;
    if ((state.round in state.pollUsers.chosen)
      && (state.qid in state.pollUsers.chosen[state.round])) {
      msg.value.pollUsers.chosen = state.pollUsers.chosen[state.round][state.qid];
    }
    msg.value.pollUsers.bank = state.pollUsers.bank;
    if (state.qid in state.result[state.round].disabledAnswers) {
      state.result[state.round].disabledAnswers[state.qid].forEach((i) => {
        msg.value.disabledAnswers[i] = true;
      });
    }
    if ((state.qid in state.result[state.round].locked)
      && (state.result[state.round].locked[state.qid])) {
      msg.value.solution.correct = state.result[state.round].correct[state.qid];
      msg.value.solution.locked = true;
    }
  }
  return msg;
}

function buildPollUserInit(uid, name) {
  const msg = { key: msgPollUserInit, value: { uid: uid, name: name} };
  return msg;
}

function buildPollUserChoice(rid, qid, uid, answer) {
  return {
    key: msgPollUserChoice,
    value: {
      round: rid, qid: qid, uid: uid, answer: answer
    }
  };
}

/*
  Principle: build functions MAY NOT change state

  TODO:
  - Take the whole solution dictioary instead of the value correct
 */

// Server -> User AND Server -> Admin
function buildUserUpdate(round, state, introOutro) {
  const msg = { key: msgUserUpdate, value: {} };
  const thisQuestion = round.questions[state.qid];
  msg.value = {
    round: state.round,
    qid: state.qid,
    disabledAnswers: [false, false, false, false],
    solution: {
      correct: -1,
      chosen: -1,
      locked: false,
    },
    jokers: {
      audience: {
        active: state.joker[state.round]['audience'] === -1,
        used: state.joker[state.round]['audience'] === state.qid
      },
      fifty: {
        active: state.joker[state.round]['fifty'] === -1,
        used: state.joker[state.round]['fifty'] === state.qid
      },
      telephone: {
        active: state.joker[state.round]['telephone'] === -1,
        used: state.joker[state.round]['telephone'] === state.qid
      },
    },
    overlay: { disable: true },
    question: { txt: 'SHOWING OVERLAY! Press NEXT in admin interface to skip!', img: '' },
    answers: ['', '', '', ''],
    warn: '',
  };
  if (!state.gameStarted) {
    msg.value.overlay = introOutro.intro;
    msg.value.overlay.disable = false;
  } else if (state.gameFinished) {
    msg.value.overlay = introOutro.outro;
    msg.value.overlay.disable = false;
  } else if (state.showIntro) {
    msg.value.overlay = round.intro;
    msg.value.overlay.disable = false;
  } else {
    msg.value.bank = state.bank;
    msg.value.oldBank = state.oldBank;
    msg.value.price = round.price;
    msg.value.question = thisQuestion.question;
    msg.value.answers = thisQuestion.answers;
    if (state.qid in state.result[state.round].chosen) {
      msg.value.solution.chosen = state.result[state.round].chosen[state.qid];
    }
    if (state.qid in state.result[state.round].disabledAnswers) {
      state.result[state.round].disabledAnswers[state.qid].forEach((i) => {
        msg.value.disabledAnswers[i] = true;
      });
    }
    if (state.qid in state.result[state.round].locked) {
      msg.value.solution.correct = state.result[state.round].correct[state.qid];
      msg.value.solution.locked = true;
    }
  }
  return msg;
}

function buildAdminUpdate(round, state) {
  const msg = { key: msgAdminUpdate, value: {} };
  const thisQuestion = round.questions[state.qid];
  msg.value = {
    round: state.round,
    qid: state.qid,
    solution: {
      correct: -1,
      chosen: -1,
      locked: false,
    },
    question: { txt: 'SHOWING OVERLAY! Press NEXT in admin interface to skip!', img: '' },
    answers: ['', '', '', ''],
    warn: '',
  };
  if (state.showIntro || !state.gameStarted || state.gameFinished) {
    msg.value.intro = round.intro;
  } else {
    msg.value.price = round.price;
    msg.value.question = thisQuestion.question;
    msg.value.answers = thisQuestion.answers;
    msg.value.solution = thisQuestion.solution;
    if ((state.round in state.result) && (state.qid in state.result[state.round].chosen)) {
      msg.value.solution.locked = state.qid in state.result[state.round].locked;
      msg.value.solution.chosen = state.result[state.round].chosen[state.qid];
    }
  }
  return msg;
}

function buildWarning(state, text) {
  return {
    key: msgWarning,
    value: {
      round: state.round,
      qid: state.qid,
      warn: text
    }
  };
}

// User -> Server
function buildChoice(rid, qid, answer) {
  return {
    key: msgChoice,
    value: {
      round: rid,
      qid: qid,
      solution: {
        chosen: answer,
      }
    }
  };
}

// Admin -> Server
function buildLockIn(rid, qid, answer) {
  return {
    key: msgLockIn,
    value: {
      round: rid,
      qid: qid,
      solution: {
        chosen: answer
      }
    }
  };
}

function buildUnlock(rid, qid) {
  return {
    key: msgUnlock,
    value: {
      round: rid,
      qid: qid,
    }
  };
}

function buildJoker(rid, qid, joker) {
  return {
    key: msgJoker,
    value: {
      round: rid,
      qid: qid,
      joker: joker
    }
  };
}

function buildNext(rid, qid, override) {
  return {
    key: msgNext,
    value: {
      round: rid,
      qid: qid,
      override: override
    }
  };
}

function buildPrev(rid, qid) {
  return {
    key: msgPrev,
    value: {
      round: rid,
      qid: qid
    }
  };
}

exports.buildUserUpdate = buildUserUpdate;
exports.buildAdminUpdate = buildAdminUpdate;
exports.buildWarning = buildWarning;
exports.buildChoice = buildChoice;
exports.buildLockIn = buildLockIn;
exports.buildUnlock = buildUnlock;
exports.buildNext = buildNext;
exports.buildPrev = buildPrev;
exports.buildJoker = buildJoker;
exports.buildPollUserChoice = buildPollUserChoice;
exports.buildPollUserInit = buildPollUserInit;
exports.buildPollUserUpdate = buildPollUserUpdate;
