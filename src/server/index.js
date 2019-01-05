const fs = require('fs');
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const sapi = require('./server_api');

const port = 8000;
let rounds = [];
let introOutro = {};

const INPUT_QUESTIONS_PATH = './inputQuestions.json';
const INPUT_QUESTIONS_TEST_PATH = './inputQuestions_test.json';
const INTRO_OUTRO_PATH = './introOutro.json';
if (fs.existsSync(INPUT_QUESTIONS_PATH)) {
  rounds = JSON.parse(fs.readFileSync(INPUT_QUESTIONS_PATH, 'utf8'));
} else if (fs.existsSync(INPUT_QUESTIONS_TEST_PATH)) {
  rounds = JSON.parse(fs.readFileSync(INPUT_QUESTIONS_TEST_PATH, 'utf8'));
} else {
  console.log('Please create a "' + INPUT_QUESTIONS_PATH + '" in the root directory of this project');
  throw 'No input file found!';
}
if (fs.existsSync(INTRO_OUTRO_PATH)) {
  introOutro = JSON.parse(fs.readFileSync(INTRO_OUTRO_PATH, 'utf8'));
} else {
  console.log('Please create a "' + INTRO_OUTRO_PATH + '" in the root directory of this project');
  throw 'No input file found!';
}
io.listen(port);
sapi.initServer(io, rounds, introOutro);


app.use(express.static('dist'));
http.listen(8080, () => console.log('Listening on port 8080'));
