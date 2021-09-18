const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(400).json({error: 'User not found.'});
  }

  request.user = user;
  return next();
}

function getTodoByID(todos, id) {
  return todos.find(todo => todo.id === id);
}

function checksExistUsername(username) {
  return users.find(user => user.username===username);
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  if (!name || name==='') {
    return response.status(400).json({error: 'Name is required'});
  }

  if (!username || username==='') {
    return response.status(400).json({error: 'Username is required'});
  }

  if (checksExistUsername(username)) {
    return response.status(400).json({error: 'Username is already in use.'});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  if (!title || title==='') {
    return response.status(400).json({error: 'Title is required'});
  }

  if (!deadline || deadline==='') {
    return response.status(400).json({error: 'Deadline is required'});
  }

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = getTodoByID(user.todos, id);
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found.' });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = getTodoByID(user.todos, id);
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found.' });
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = getTodoByID(user.todos, id);
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found.' });
  }

  user.todos.splice(todo, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;