const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const user = require('./routes/user');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(user);

app.get('/', (req, res, next) => {
    console.log('THIS IS A / GET CALL');
    console.log('Password: 123456');
    let encrypt = saltHashPassword("123456");
    console.log('Encrypt: ' + encrypt.passwordHash);
    console.log('Salt: '+ encrypt.salt);
    res.send('Hello World')
});

app.listen(3000, ()=> {
    console.log('Server listening on port ' +3000);
});