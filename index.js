const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');


const user = require('./routes/user');
const category = require('./routes/category');
const order = require('./routes/order');
const recipe = require('./routes/recipe');
const instruction = require('./routes/instruction');
const utensils = require('./routes/utensil');
const ingredient = require('./routes/ingredient');
const promotion = require('./routes/promotion');

app.use(morgan('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(user);
app.use(category);
app.use(order);
app.use(recipe);
app.use(instruction);
app.use(utensils);
app.use(ingredient);
app.use(promotion);

app.get('/', (req, res, next) => {
    console.log('THIS IS A / GET CALL');
    res.send('Hello World')
});

app.listen(3000, ()=> {
    console.log('Server listening on port ' +3000);
});