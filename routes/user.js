const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');
const uuid = require('uuid');
const emailValidator = require("email-validator");
const libPhoneNumber = require('libphonenumber-js');
const HttpStatus = require('http-status-codes');

const headerUserToken = 'usertoken';
const queryCheckIfTokenExistsAndCorrespondsToUser = 'SELECT id, connection_token from user where connection_token = ? AND id=?';
const querySelectUser = 'SELECT * FROM user where email_address=?';
const queryInsertUser = 'INSERT INTO user (email_address, name, first_name, password, phone_number, postal_address, register_datetime, salt, last_connection_datetime, connection_token) VALUES (?,?,?,?,?,?, NOW(), ?, NOW(), ?)';
const queryUpdateUser = 'UPDATE user SET email_address = ? , name = ? , first_name = ?, password = ?, phone_number = ?, postal_address = ?, salt = ? WHERE id = ?';
const querySelectTokenFromUser = 'SELECT connection_token FROM user where email_address=?';


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

function checkHashPassword(user_password, salt) {
    let passwordData = sha512(user_password, salt);
    return passwordData;
}

function convertToInternationalFormat(phoneNumber){
    let asYouType = new libPhoneNumber.AsYouType('FR').input(phoneNumber);
    let phoneNumberFromString = libPhoneNumber.parsePhoneNumberFromString(asYouType, 'FR');
    let internationalFormat = phoneNumberFromString.formatInternational();
    return internationalFormat.replace(/\s+/g, '');
}

function checkEmailValidity(email){
    return emailValidator.validate(email);
}

function checkIfFieldsAreEmpty(... allFields){
    console.log('checkUserInput : ' +allFields);
    for (field  of allFields) {
        if (field.toString().trim().length === 0){
            console.log(field);
            return false
        }
    }
    return true;
}

function checkIfFieldsAreUndefined(... allFields){
    console.log('checkUserInput : ' +allFields);
    for (field  of allFields) {
        if (typeof field === typeof undefined){
            console.log(field);
            return false
        }
    }
    return true;
}

const router = express.Router();

router.get('/users', (req, res) => {
    const connection = getConnection();
    let queryString = "SELECT * FROM user";
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

router.post('/users/register',(req, res, next)=> {

    const connection = getConnection();

    let post_data = req.body; //Get POST params
    console.log('post_data : '+JSON.stringify(post_data))

    let inputEmail = post_data.inputEmail;
    let plaint_password = post_data.inputPassword;  //Get the plaintext userPassword
    let inputName = post_data.inputName;
    let inputFirstName = post_data.inputFirstName;
    let inputPhoneNumber = post_data.inputPhoneNumber;
    let inputPostalAddress = post_data.inputPostalAddress;

    if (checkIfFieldsAreUndefined(inputEmail, plaint_password, inputName, inputFirstName, inputPhoneNumber, inputPostalAddress)) {

        if(checkIfFieldsAreEmpty(inputEmail, plaint_password, inputName, inputFirstName, inputPhoneNumber, inputPostalAddress)){
            let hash_data = saltHashPassword(plaint_password);
            let userPassword = hash_data.passwordHash;
            let salt = hash_data.salt;
            let uid = uuid.v4();
            inputPhoneNumber = convertToInternationalFormat(inputPhoneNumber);

            if (checkIfFieldsAreEmpty(inputName, inputFirstName, inputEmail, inputPhoneNumber, inputPostalAddress, plaint_password) && checkEmailValidity(inputEmail)){
                connection.query(querySelectUser, [inputEmail] , function(err, result, fields) {
                    connection.on('error', function (err) {
                        console.log('[MySQL ERROR]: ', err);
                    });
                    if (result && result.length ){
                        console.log('Result : '+result);
                        console.log('Result Json.stringify : '+JSON.stringify(result));
                        console.log('Fields : '+fields);
                        console.log('Fields Json.stringify : '+JSON.stringify(fields));
                        res.status(HttpStatus.CONFLICT).send('User Already Exists');
                    }
                    else {
                        connection.query(queryInsertUser, [inputEmail, inputName, inputFirstName, userPassword, inputPhoneNumber, inputPostalAddress, salt, uid], (err, result, fields) => {
                            connection.on('error', function (err) {
                                console.log('[MySQL ERROR', err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Register error: ', err);
                            });
                            if (result.insertId) {
                                console.log('Result : '+result);
                                console.log('Result Json.stringify : '+JSON.stringify(result));
                                console.log('Result.insertId : '+result.insertId);
                                console.log('Fields : '+fields);
                                console.log('Fields Json.stringify : '+JSON.stringify(fields));
                                res.status(HttpStatus.CREATED).send('User Created Successfully');
                            }
                        });
                    }
                });
            } else {
                res.status(HttpStatus.BAD_REQUEST).send('User inputs are not correct');
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('At least one input is empty');
        }
    } else {
        res.status(HttpStatus.BAD_REQUEST).send('At least one input is not defined')
    }
});

router.post('/users/login', (req, res, next)=> {

    console.log('users/login: ');
    const  connection = getConnection();

    let post_data = req.body;
    let inputPassword = post_data.inputPassword;
    let inputEmail = post_data.inputEmail;

    if (checkIfFieldsAreEmpty(inputEmail, inputPassword) && checkEmailValidity(inputEmail)) {
        connection.query(querySelectUser, [inputEmail] , function(err, result, fields) {
            connection.on('error', function (err) {
                console.log('[MySQL ERROR]', err);
            });
            // console.log(result);
            if (result && result.length ){
                let salt = result[0].salt;
                let encrypted_password = result[0].password;
                let hashed_password = checkHashPassword(inputPassword, salt).passwordHash;
                let newToken = uuid.v4();
                if (encrypted_password === hashed_password) {
                    connection.query(queryUpdateUser, [newToken, inputEmail], function (err, result, fields) {
                        connection.on('error', function (err) {
                           console.log('[MySQL ERROR]', err);
                        });
                        if (typeof result !== typeof undefined){
                            connection.query(querySelectTokenFromUser, [inputEmail], function (err, result, fields) {
                                connection.on('error', function (err) {
                                    console.log('[MySQL ERROR]', err);
                                });
                                if (typeof result[0] !== typeof undefined){
                                    res.status(HttpStatus.OK).send(JSON.stringify(result[0])); //Send the token back to the user
                                }
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
                res.status(HttpStatus.BAD_REQUEST).json('User does not exist');
            }
        });
    } else {
        res.status(HttpStatus.BAD_REQUEST).send('User Input are not correct');
    }
});

router.post('/users/update',(req, res, next)=> {

    if (req.headers[headerUserToken] !== undefined){
        const connection = getConnection();

        let post_data = req.body; //Get POST params
        console.log('post_data : '+JSON.stringify(post_data))

        let inputEmail = post_data.inputEmail;
        let inputUserId = post_data.inputUserId;
        let plaint_password = post_data.inputPassword;  //Get the plaintext userPassword
        let inputName = post_data.inputName;
        let inputFirstName = post_data.inputFirstName;
        let inputPhoneNumber = post_data.inputPhoneNumber;
        let inputPostalAddress = post_data.inputPostalAddress;

        if (checkIfFieldsAreUndefined(inputEmail, plaint_password, inputName, inputFirstName, inputPhoneNumber, inputPostalAddress, inputUserId)) {

            if(checkIfFieldsAreEmpty(inputEmail, plaint_password, inputName, inputFirstName, inputPhoneNumber, inputPostalAddress, inputUserId)){
                let hash_data = saltHashPassword(plaint_password);
                let userPassword = hash_data.passwordHash;
                let salt = hash_data.salt;
                inputPhoneNumber = convertToInternationalFormat(inputPhoneNumber);

                if (checkIfFieldsAreEmpty(inputName, inputFirstName, inputEmail, inputPhoneNumber, inputPostalAddress, plaint_password, inputUserId) && checkEmailValidity(inputEmail)){

                    connection.query(queryCheckIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId] , function(err, result, fields) {
                        connection.on('error', function (err) {
                            console.log('[MySQL ERROR]: ', err);
                        });
                        if (result && result.length > 0){
                            //TODO: ce code fonctionne avec la librairie mysql-utilities, checker si ca vaut le coup
                            /*connection.update(
                                'user',
                                { email_address: inputEmail,
                                  password: userPassword,
                                  salt: salt,
                                  name: inputName,
                                  first_name: inputFirstName,
                                  phone_number: inputPhoneNumber,
                                  postal_address: inputPostalAddress,
                                },
                                { id: inputUserId },
                                (err, affectedRows) => {
                                    console.dir({ update: affectedRows });
                                }
                            );*/
                            connection.query(queryUpdateUser, [inputEmail, inputName, inputFirstName, userPassword, inputPhoneNumber, inputPostalAddress, salt, inputUserId], (err, result, fields) => {
                                connection.on('error', function (err) {
                                    console.log('[MySQL ERROR]', err);
                                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Register error: ', err);
                                });
                                if (result.affectedRows ) {
                                    res.status(HttpStatus.CREATED).send('User Updated Successfully');
                                }
                            });
                        } else{
                            res.status(HttpStatus.BAD_REQUEST).send('Token and UserId do not match');
                        }
                    });
                } else {
                    res.status(HttpStatus.BAD_REQUEST).send('User inputs are not correct');
                }
            } else {
                res.status(HttpStatus.BAD_REQUEST).send('At least one input is empty');
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('At least one input is not defined')
        }
    } else {
        res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
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