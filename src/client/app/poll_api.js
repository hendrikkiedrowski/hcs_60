import io from 'socket.io-client';

const mesg = require('../../messages/messages');

const debug = true;
const ns = io('http://localhost:8000/pollNsp');

function randomString() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const strLength = 8;
  let randomStr = '';
  for (let i = 0; i < strLength; i++) {
    let num = Math.floor(Math.random() * chars.length);
    randomStr += chars[num];
  }
  return randomStr;
}

export function createPollUserState() {
  return {
    uid: '',
    name: '',
    qid: '',
    round: '',
    bank: 0,
    answers: ['-', '-', '-', '-'],
    disabledAnswers: [false, false, false, false],
    solution: {
      chosen: -1,
      correct: -1,
    },
    warn: '',
  };
}

function sendPollUserInit(uid, name) {
  const msg = mesg.buildPollUserInit(uid, name);
  console.log('-> ' + msg.key);
  if (debug) console.log(msg);
  ns.emit(msg.key, msg.value);
}

export function sendPollUserChoice(rid, qid, uid, answerNumber) {
  const msg = mesg.buildPollUserChoice(rid, qid, uid, answerNumber);
  console.log('-> ' + msg.key);
  if (debug) console.log(msg);
  ns.emit(msg.key, msg.value);
}

export function initPollUser(user, func) {
  const uid = randomString();
  sendPollUserInit(uid, user);
  func({ uid: uid, name: user });
  ns.on(mesg.msgPollUserUpdate, (msg) => {
    console.log('<- ' + mesg.msgPollUserUpdate);
    if (debug) console.log(msg);
    if (uid in msg.pollUsers.chosen) {
      msg.solution.chosen = msg.pollUsers.chosen[uid];
    }
    if (uid in msg.pollUsers.bank) {
      msg.bank = msg.pollUsers.bank[uid];
    }
    func(msg);
  });
  ns.on(mesg.msgWarning, (msg) => {
    console.log('<- ' + mesg.msgWarning);
    if (debug) console.log(msg);
    func(msg);
  });
}
