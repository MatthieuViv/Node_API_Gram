const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');
const uuid = require('uuid');
const emailValidator = require("email-validator");
const libPhoneNumber = require('libphonenumber-js');

const querySelectUser = 'SELECT * FROM utilisateurs where email=?';
const queryInsertUser = 'INSERT INTO utilisateurs (email, nom, prenom, mot_de_passe, telephone, adresse, date_inscription, salt, last_connection, unique_id) VALUES (?,?,?,?,?,?, NOW(), ?, NOW(), ?)'
const queryUpdateUser = 'UPDATE utilisateurs SET last_connection = NOW(), unique_id = ? WHERE email =?';
const querySelectTokenFromUser = 'SELECT unique_id FROM utilisateurs where email=?';


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

function checkValidityOfUserDetails(email){
    return emailValidator.validate(email);
}

function convertToInternationalFormat(phoneNumber){
    let asYouType = new libPhoneNumber.AsYouType('FR').input(phoneNumber);
    let phoneNumberFromString = libPhoneNumber.parsePhoneNumberFromString(asYouType, 'FR');
    let internationalFormat = phoneNumberFromString.formatInternational();
    return internationalFormat.replace(/\s+/g, '');
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

    console.log('users/register: ')

    const connection = getConnection();

    let post_data = req.body; //Get POST params

    let uid = uuid.v4();
    let plaint_password = post_data.password; //Get the plaintext password
    let hash_data = saltHashPassword(plaint_password);
    let password = hash_data.passwordHash;
    let salt = hash_data.salt;

    let email = post_data.email;
    let name = post_data.name;
    let firstName = post_data.firstName;
    let phoneNumber = post_data.phoneNumber;
    phoneNumber = convertToInternationalFormat(phoneNumber);
    let address = post_data.address;

    connection.query(querySelectUser, [email] , function(err, result, fields) {
        connection.on('error', function (err) {
            console.log('[MySQL ERROR', err);
        });
        if (result && result.length ){
            res.json('User already exists !!! ');
        }
        else {
            ;
            connection.query(queryInsertUser, [email, name, firstName, password, phoneNumber, address, salt, uid], (err, result, fields) => {
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

    console.log('users/login: ')
    const  connection = getConnection();

    let post_data = req.body;
    let user_password = post_data.password;
    let user_email = post_data.email;
    console.log(user_email);

    if (checkValidityOfUserDetails(user_email)) {
        connection.query(querySelectUser, [user_email] , function(err, result, fields) {
            connection.on('error', function (err) {
                console.log('[MySQL ERROR]', err);
            });
            // console.log(result);
            if (result && result.length ){
                let salt = result[0].salt;
                let encrypted_password = result[0].mot_de_passe;
                let hashed_password = checkhashPassword(user_password, salt).passwordHash;
                let newToken = uuid.v4();
                if (encrypted_password == hashed_password) {
                    connection.query(queryUpdateUser, [newToken, user_email], function (err, result, fields) {
                        connection.on('error', function (err) {
                           console.log('[MySQL ERROR]', err);
                        });
                        if (result){
                            connection.query(querySelectTokenFromUser, [user_email], function (err, result, fields) {
                                connection.on('error', function (err) {
                                    console.log('[MySQL ERROR]', err);
                                });
                                res.end(JSON.stringify(result[0])); //Send the token back to the user
                            });
                        }
                        console.log('User last_connection updated');
                        // res.end(JSON.stringify(result[0])) //If password is true, return all info of user
                    });
                } else
                    res.end(JSON.stringify('Wrong password'))
            }
            else {
                console.log('User does not exist');
                res.json('User does not exist');
            }
        });
    } else {
        res.end("The input fields are not valid");
    }

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