require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const sportsRoutes = require('./routes/sportRoutes');
const roomsRoutes = require('./routes/roomRoutes');

const globalErrorHandler = require('./middleware/errorMiddleware');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json());


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/events', eventRoutes);
app.use('/sports', sportsRoutes);
app.use('/rooms', roomsRoutes);

app.get('/', (req, res) => {
  res.render('events');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/myevents', (req, res) => {
  res.render('myevents');
});

app.get('/coachdashboard', (req, res) => {
  res.render('coachdashboard');
});

app.get('/admin', (req, res) => {
  res.render('admin');
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
