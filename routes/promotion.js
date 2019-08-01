const express = require('express');
const mysql = require('mysql');
const HttpStatus = require('http-status-codes');
const headerUserToken = 'usertoken';


const SelectRecipe = "SELECT * from recipe where id = ? ";
const SelectAllPromotions = "SELECT * from promotion";
const queryCheckIfTokenExistsAndCorrespondsToUser = 'SELECT id, connection_token from user where connection_token = ? AND id=?';


const router = express.Router();
let connection = getConnection();

function getConnection() {
    let connection = mysql.createConnection({
        host     : 'localhost',
        user: 'root',
        password : 'password',
        database : 'gram'
    });
    return connection;
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

router.get('/promotions/', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;

    if (checkIfFieldsAreUndefined(inputUserId)) {
        if (checkIfFieldsAreEmpty(inputUserId)) {
            if (req.headers[headerUserToken] !== undefined) {
                connection.query(queryCheckIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    connection.on('error', function (err) {
                        console.log('[MySQL Error] : ' + err)
                    });
                    if (result && result.length > 0) {
                        connection.query(SelectAllPromotions,  (err, result, fields) => {
                            if (err) {
                                console.log('[MySQL Error] : ' + err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            } else if (result && result.length > 0) {
                                console.log('Result : ' + JSON.stringify(result));
                                res.status(HttpStatus.OK).send(JSON.stringify(result));
                            } else {
                                res.status(HttpStatus.BAD_REQUEST).send('This recipe does not have any ingredient');
                            }
                        });
                    } else {
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
                    }
                });
            }
            else {
                res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('At least one input is empty')
        }
    } else {
        res.status(HttpStatus.BAD_REQUEST).send('At least one input is not defined')
    }
});

module.exports = router;