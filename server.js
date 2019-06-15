'use strict';

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
const movieData = require('./movie-data');

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(function validateBearer(req, res, next) {
  const API_TOKEN = process.env.API_TOKEN;
  if (req.get('Authorization') && req.get('Authorization').split(' ')[1] === API_TOKEN) {
    next();
  } else {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
});

app.get('/movie', (req, res) => {
  const { genre, country, avg_vote } = req.query;

  let movies = movieData;

  if (genre) {
    movies = movies.filter(movie => {
      return movie['genre'].toLowerCase().includes(genre.toLowerCase());
    });
  }
  if (country) {
    movies = movies.filter(movie => {
      return movie['country'].toLowerCase().includes(country.toLowerCase());
    });
  }
  if (avg_vote) {
    if (isNaN(avg_vote)) {
      res.status(400).send('Please enter valid number');
    }
    movies = movies.filter(movie => {
      return movie['avg_vote'] >= parseInt(avg_vote);
    });
  }

  res.status(200).type('json').send(JSON.stringify(movies));
});

app.get('/*', (req, res) => {
  res.status(404).json({ error: 'Page does not exist' });
});

app.use((req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { message: 'server error' };
  } else {
    response = { message: 'error encountered on method ' + req.method + ' on path ' + req.path };
  }
  res.status(500).json(response);
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error, message: 'server error' };
  } else {
    response = { error, message: 'error encountered on method ' + req.method + ' on path ' + req.path };
  }
  res.status(500).json(response);
});


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  // console.log(`Server listening at http://localhost:${PORT}`);
});
