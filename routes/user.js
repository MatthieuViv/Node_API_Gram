const express = require('express');
const crypto = require('crypto');
const HttpStatus = require('http-status-codes');

const headerUserToken = 'usertoken';

import {getConnection, checkIfFieldsAreUndefined, checkIfFieldsAreEmpty, checkPassword, checkEmailValidity, convertToInternationalFormat, checkHashPassword} from '../helpers/utils';
import {USER_QUERIES} from "../helpers/queries";

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

const router = express.Router();

router.get('/checkConnexion', tokenChecker(getConnection), (req, res) => {
    const userInfo = res.locals.userInfo;
    res.status(HttpStatus.OK).send(userInfo);
});

router.post('/users/register', (req, res, next) => {
    let post_data = req.body; //Get POST params
    let inputEmail = post_data.inputEmail;
    let plaint_password = post_data.inputPassword;  //Get the plaintext userPassword
    let inputName = post_data.inputName;
    let inputFirstName = post_data.inputFirstName;
    let inputPhoneNumber = post_data.inputPhoneNumber;
    let inputPostalAddress = post_data.inputPostalAddress;

    if (!(checkIfFieldsAreUndefined(inputEmail, plaint_password, inputName, inputFirstName, inputPhoneNumber, inputPostalAddress) && checkIfFieldsAreEmpty(inputEmail, plaint_password, inputName, inputFirstName, inputPhoneNumber, inputPostalAddress)) ) {
        return res.status(HttpStatus.BAD_REQUEST).send('Merci de remplir les champs.');
    }
    if (!checkEmailValidity(inputEmail)) {
        return res.status(HttpStatus.BAD_REQUEST).send('Adresse email non valide.');
    }
    if (!checkPassword(plaint_password)) {
        return res.status(HttpStatus.BAD_REQUEST).send('Mot de passe non valide.');
    }

    let hash_data = saltHashPassword(plaint_password);
    let userPassword = hash_data.passwordHash;
    let salt = hash_data.salt;
    let uid = uuid.v4();
    inputPhoneNumber = convertToInternationalFormat(inputPhoneNumber);
    if (!inputPhoneNumber) {
        return res.status(HttpStatus.BAD_REQUEST).send('Numéro de téléphone non valide.');
    }

    getConnection.query(USER_QUERIES.selectWithEmail, [inputEmail], function (err, result, fields) {
        if (err) {
            console.log('[MySQL ERROR', err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Error');
        }
        if (result && result.length) {
            return res.status(HttpStatus.CONFLICT).send('Cette adresse email est déja utilisée');
        }
        getConnection.query(USER_QUERIES.insert, [inputEmail, inputName, inputFirstName, userPassword, inputPhoneNumber, inputPostalAddress, salt, uid], (err, result, fields) => {
            if (err) {
                console.log('[MySQL ERROR', err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Error');
            }
            getConnection.query(USER_QUERIES.selectWithId, [result.insertId], (err, result, fields) => {
                if (err) {
                    console.log('[MySQL ERROR', err);
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Error');
                }
                res.status(HttpStatus.CREATED).send(JSON.stringify(result[0]));
            });
        });
    });
});

router.post('/users/login', (req, res, next) => {
    let post_data = req.body;
    let inputPassword = post_data.inputPassword;
    let inputEmail = post_data.inputEmail;

    getConnection.query(USER_QUERIES.selectWithEmail, [inputEmail], function (err, result, fields) {
        if (err) {
            console.log('[MySQL ERROR', err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Error');
        }
        if (!(result && result.length)) {
            return res.status(HttpStatus.BAD_REQUEST).send('Connexion impossible');
        }
        let salt = result[0].salt;
        let encrypted_password = result[0].password;
        let hashed_password = checkHashPassword(inputPassword, salt).passwordHash;
        let newToken = uuid.v4();
        if (encrypted_password != hashed_password) {
            return res.status(HttpStatus.BAD_REQUEST).send('Connexion impossible');
        }
        getConnection.query(USER_QUERIES.updateUserToken, [newToken, inputEmail], function (err, result, fields) {
            if (err) {
                console.log('[MySQL ERROR', err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Error');
            }
            getConnection.query(USER_QUERIES.selectWithEmail, [inputEmail], function (err, result, fields) {
                getConnection.on('error', function (err) {
                    console.log('[MySQL ERROR]', err);
                });
                if (result && result.length > 0) {
                    res.status(HttpStatus.OK).send({ token: result[0].getConnection_token, id: result[0].id }); //Send the token and ID back to the user
                } else {
                    console.log('Internal server error');
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
                }
            });
        });
    });
});

router.post('/users/update', (req, res, next) => {

    if (req.headers[headerUserToken] !== undefined) {


        let post_data = req.body; //Get POST params
        console.log('post_data : ' + JSON.stringify(post_data))

        let inputEmail = post_data.inputEmail;
        let inputUserId = post_data.inputUserId;
        let plaint_password = post_data.inputPassword;  //Get the plaintext userPassword
        let inputName = post_data.inputName;
        let inputFirstName = post_data.inputFirstName;
        let inputPhoneNumber = post_data.inputPhoneNumber;
        let inputPostalAddress = post_data.inputPostalAddress;

        if (checkIfFieldsAreUndefined(inputEmail, plaint_password, inputName, inputFirstName, inputPhoneNumber, inputPostalAddress, inputUserId)) {

            if (checkIfFieldsAreEmpty(inputEmail, plaint_password, inputName, inputFirstName, inputPhoneNumber, inputPostalAddress, inputUserId)) {
                let hash_data = saltHashPassword(plaint_password);
                let userPassword = hash_data.passwordHash;
                let salt = hash_data.salt;
                inputPhoneNumber = convertToInternationalFormat(inputPhoneNumber);

                if (checkIfFieldsAreEmpty(inputName, inputFirstName, inputEmail, inputPhoneNumber, inputPostalAddress, plaint_password, inputUserId) && checkEmailValidity(inputEmail)) {

                    getConnection.query(USER_QUERIES.checkIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                        getConnection.on('error', function (err) {
                            console.log('[MySQL ERROR]: ', err);
                        });
                        if (result && result.length > 0) {
                            getConnection.query(USER_QUERIES.update, [inputEmail, inputName, inputFirstName, userPassword, inputPhoneNumber, inputPostalAddress, salt, inputUserId], (err, result, fields) => {
                                getConnection.on('error', function (err) {
                                    console.log('[MySQL ERROR]', err);
                                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Register error: ', err);
                                });
                                if (result.affectedRows) {
                                    res.status(HttpStatus.CREATED).send('User Updated Successfully');
                                }
                            });
                        } else {
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


module.exports = router;
