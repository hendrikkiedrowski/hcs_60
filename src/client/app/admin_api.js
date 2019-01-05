import io from 'socket.io-client';

const mesg = require('../../messages/messages');
const debug = true;

const ns = io('http://localhost:8000/adminNsp');

// TODO: remove!
export function createAdminState() {
  return {
    qid: -1,
    question: {
      isImg: false,
      content: '???'
    },
    solution: {
      chosen: -1,
      correct: -1
    },
    round: 0,
    warn: ''
  };
}

export function initAdmin(func) {
  console.log('admin API initialized');
  ns.on(mesg.msgAdminUpdate, (msg) => {
    console.log('<- ' + mesg.msgAdminUpdate);
    if (debug) console.log(msg);
    func(msg);
  });
  ns.on(mesg.msgWarning, (msg) => {
    console.log('<- ' + mesg.msgWarning);
    if (debug) console.log(msg);
    func(msg);
  });
}

export function sendAccept(round, qid) {
  const msg = mesg.buildNext(round, qid, false);
  console.log('-> ' + msg.key);
  if (debug) console.log(msg.value);
  ns.emit(msg.key, msg.value);
}

export function sendNext(round, qid) {
  const msg = mesg.buildNext(round, qid, true);
  console.log('-> ' + msg.key);
  if (debug) console.log(msg.value);
  ns.emit(msg.key, msg.value);
}

export function sendPrev(rid, qid) {
  const msg = mesg.buildPrev(rid, qid);
  console.log('-> ' + msg.key);
  if (debug) console.log(msg.value);
  ns.emit(msg.key, msg.value);
}

export function sendLockIn(rid, qid, answer) {
  const msg = mesg.buildLockIn(rid, qid, answer);
  console.log('-> ' + msg.key);
  if (debug) console.log(msg.value);
  ns.emit(msg.key, msg.value);
}

export function sendUnlock(rid, qid) {
  const msg = mesg.buildUnlock(rid, qid);
  console.log('-> ' + msg.key);
  if (debug) console.log(msg.value);
  ns.emit(msg.key, msg.value);
}
