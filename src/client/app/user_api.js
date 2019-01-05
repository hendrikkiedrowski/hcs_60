import io from 'socket.io-client';

const mesg = require('../../messages/messages');

const debug = true;
const ns = io('http://localhost:8000/userNsp');

// TODO: remove!
export function createUserState() {
  return {
    qid: -1,
    question: {
      img: '',
      txt: '???',
    },
    answers: ['-', '-', '-', '-'], // exactly 4!
    disabledAnswers: [false, false, false, false],
    solution: {
      chosen: -1,
      correct: -1
    },
    jokers: {
      audience: {
        active: true,
        used: false
      },
      fifty: {
        active: true,
        used: false
      },
      telephone: {
        active: true,
        used: false
      },
    },
    overlay: {
      disable: false
    },
    round: 0,
    bank: 0,
    oldBank: 0,
    warn: ''
  };
}

export function initUser(func) {
  console.log('user API initialized');
  ns.on(mesg.msgUserUpdate, (msg) => {
    console.log('<- ' + mesg.msgUserUpdate);
    if (debug) console.log(msg);
    func(msg);
  });
  ns.on(mesg.msgWarning, (msg) => {
    console.log('<- ' + mesg.msgWarning);
    if (debug) console.log(msg);
    func(msg);
  });
}

export function sendMsgChoice(rid, qid, answerNumber) {
  const msg = mesg.buildChoice(rid, qid, answerNumber);
  console.log('-> ' + msg.key);
  if (debug) console.log(msg);
  ns.emit(msg.key, msg.value);
}

export function sendAudienceJoker(rid, qid) {
  const msg = mesg.buildJoker(rid, qid, "audience");
  console.log('-> ' + msg.key);
  if (debug) console.log(msg);
  ns.emit(msg.key, msg.value);
}

export function sendFiftyJoker(rid, qid) {
  const msg = mesg.buildJoker(rid, qid, "fifty");
  console.log('-> ' + msg.key);
  if (debug) console.log(msg);
  ns.emit(msg.key, msg.value);
}

export function sendTelephoneJoker(rid, qid) {
  const msg = mesg.buildJoker(rid, qid, "telephone");
  console.log('-> ' + msg.key);
  if (debug) console.log(msg);
  ns.emit(msg.key, msg.value);
}
