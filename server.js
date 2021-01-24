const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let raw = fs.readFileSync('data.json')
let planner_data = JSON.parse(raw)

app.get('/api/planner', cors(), (req, res) => {
  res.json(planner_data);
});

app.get('/api/rooms', cors(), (req, res) => {
  res.json(planner_data.rooms);
});

app.get('/api/teachers', cors(), (req, res) =>  {
  res.json(planner_data.teachers);
});

app.get('/api/groups', cors(), (req, res) => {
  res.json(planner_data.groups);
});

app.get('/api/lessons', cors(), (req, res) => {
  res.json(planner_data.lessons);
});

app.get('/api/activities', cors(), (req, res) => {
  res.json(planner_data.activities);
});

app.post('/api/add_activity', cors(), (req, res) => {
  planner_data['activities'].push(req.body);
  fs.writeFileSync('data.json', JSON.stringify(planner_data));
  res.json({"result" : true});
});

app.post('/api/edit_activity', cors(), (req, res) => {
  let edit = req.body;
  planner_data['activities'].forEach((item) => {
    if (item.slot === edit["slot"] && item.room === edit["room"]) {
      item = edit;
    }
  });
  fs.writeFileSync('data.json', JSON.stringify(planner_data));
  res.json({"result" : true});
});

const port = 5000;

app.listen(port, () => `Server running on port ${port}`);