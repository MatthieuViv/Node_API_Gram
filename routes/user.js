const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');
const uuid = require('uuid');

let genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString(('hex'))
        .slice(0, length);
};

let sha512 = function (password, salt){
    let hash = crypto.createHmac('sha512', salt.toString()); //USE SHA512
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

function saltHashPassword(userPassword){
    let salt = genRandomString(16);
    let passwordData = sha512(userPassword, salt);
    return passwordData;
}

function checkhashPassword(user_password, salt) {
    let passwordData = sha512(user_password, salt);
    return passwordData;
}

function checkVallidityOfUserDetails(){

    return true;
}

const router = express.Router();

router.get('/users', (req, res) => {
    const connection = getConnection();
    let queryString = "SELECT * FROM utilisateurs";
    connection.query(queryString, (err, rows, fields) => {
        if (err) {
            res.sendStatus(500);
            console.log(err);
        }
        else {
            console.log('Query done');
            res.json(rows);
        }
    });
});

router.post('/users/register/',(req, res, next)=> {

    const connection = getConnection();

    let post_data = req.body; //Get POST params

    let uid = uuid.v4();
    console.log(uid);
    let plaint_password = post_data.password; //Get the plaintext password
    let hash_data = saltHashPassword(plaint_password);
    let password = hash_data.passwordHash;
    let salt = hash_data.salt;

    let email = post_data.email;
    let name = post_data.name;
    let firstName = post_data.firstName;
    let phoneNumber = post_data.phoneNumber;
    let address = post_data.address;

    connection.query('SELECT * FROM utilisateurs where email=?', [email] , function(err, result, fields) {
        connection.on('error', function (err) {
            console.log('[MySQL ERROR', err);
        });
        if (result && result.length ){
            res.json('User already exists !!! ');
        }
        else {
            let queryInsert = 'INSERT INTO utilisateurs (email, nom, prenom, mot_de_passe, telephone, adresse, date_inscription, salt, last_connection, unique_id) VALUES (?,?,?,?,?,?, NOW(), ?, NOW(), ?)';
            connection.query(queryInsert, [email, name, firstName, password, phoneNumber, address, salt, uid], (err, result, fields) => {
                connection.on('error', function (err) {
                    console.log('[MySQL ERROR', err);
                    res.json('Register error: ', err);
                });
                // res.json(result);
                res.json('Register successful');
            });
        }
    });
});

router.post('/users/login', (req, res, next)=> {
    const  connection = getConnection();

    let post_data = req.body;
    let user_password = post_data.password;
    let user_email = post_data.email;
    connection.query('SELECT * FROM utilisateurs where email=?', [user_email] , function(err, result, fields) {
        connection.on('error', function (err) {
            console.log('[MySQL ERROR]', err);
        });
        console.log(result);
        if (result && result.length ){
            let salt = result[0].salt;
            let encrypted_password = result[0].mot_de_passe;
            let hashed_password = checkhashPassword(user_password, salt).passwordHash;
            if (encrypted_password == hashed_password) {
                let queryUpdateUser = 'UPDATE utilisateurs SET last_connection = NOW() WHERE email =?';
                connection.query(queryUpdateUser, [user_email], (err, result, fields) => {
                    console.log('User last_connection updated');
                });
                res.end(JSON.stringify(result[0])) //If password is true, return all info of user
            } else
                res.end(JSON.stringify('Wrong password'))
        }
        else {
            console.log('User does not exist');
            res.json('User does not exist');
        }
    });

});



function getConnection() {
    return connection = mysql.createConnection({
        host     : 'localhost',
        user: 'root',
        password : 'password',
        database : 'gram'
    });
}

module.exports = router;