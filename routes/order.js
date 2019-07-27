const express = require('express');
const mysql = require('mysql');
const HttpStatus = require('http-status-codes');
const headerUserToken = 'usertoken';
const ORDERS_TABLE = "orders";
const ORDERS_RECIPE_TABLE = "orders_recipe";

const queryCheckIfTokenExistsAndCorrespondsToUser = 'SELECT id, connection_token from user where connection_token = ? AND id=?';
const queryAllOrdersFromUser = "SELECT * FROM "+ ORDERS_TABLE +" WHERE "+ORDERS_TABLE+".user_id = ?";
const querySelectOrder = "SELECT * FROM "+ORDERS_TABLE+" WHERE "+ORDERS_TABLE+".id = ? AND "+ORDERS_TABLE+".user_id = ?";
const queryInsertOrder = "INSERT INTO "+ ORDERS_TABLE +"(order_datetime, delivery_datetime, user_id, price, status_id) VALUES (NOW(), NOW(), ?, ?, '1')";

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
let connection = getConnection();

router.get('/orders/user/:userId', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    inputUserId = req.params.userId;

    console.log(req.params.userId);
    if (checkIfFieldsAreUndefined(inputUserId)) {
        if (checkIfFieldsAreEmpty(inputUserId)) {
            if (req.headers[headerUserToken] !== undefined) {
                connection.query(queryCheckIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    connection.on('error', function(err) {
                        console.log('[MySQL Error]')
                    });
                    if (result && result.length > 0) {
                        connection.query(queryAllOrdersFromUser, [inputUserId], (err, result, fields) => {
                            if(err){
                                console.log('[MySQL Error]' +err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            } else if (result && result.length > 0){
                                console.log('Result : '+JSON.stringify(result));
                                res.status(HttpStatus.OK).send(JSON.stringify(result));
                            } else
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                        });
                    } else {
                        res.status(HttpStatus.BAD_REQUEST).send('Token and userId do not match');
                    }
                });
            }else {
                res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('At least one input is empty');
        }
    } else {
        res.status(HttpStatus.BAD_REQUEST).send('At least one input is not defined')
    }

});

router.get('/orders/:orderId', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    inputOrderId = req.params.orderId;

    console.log(inputOrderId);
    console.log(inputUserId);

    if (checkIfFieldsAreUndefined(inputUserId, inputOrderId)) {
        if (checkIfFieldsAreEmpty(inputUserId, inputOrderId)) {
            if (req.headers[headerUserToken] !== undefined) {
                connection.query(queryCheckIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    connection.on('error', function(err) {
                        console.log('[MySQL Error] : '+err)
                    });
                    if (result && result.length > 0) {
                        connection.query(querySelectOrder, [inputOrderId, inputUserId], (err, result, fields) => {
                            if(err){
                                console.log('[MySQL Error] : '+err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            } else if (result && result.length > 0){
                                console.log('Result : '+JSON.stringify(result));
                                res.status(HttpStatus.OK).send(JSON.stringify(result));
                            } else
                                res.status(HttpStatus.BAD_REQUEST).send('userId and orderId do not match');
                        });
                    } else {
                        res.status(HttpStatus.BAD_REQUEST).send('Token and userId do not match');
                    }
                });
            }else {
                res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('At least one input is empty');
        }
    } else {
        res.status(HttpStatus.BAD_REQUEST).send('At least one input is not defined')
    }

});

router.post('/orders/users/', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    let inputOrderPrice = post_data.inputOrderPrice;

    if (checkIfFieldsAreUndefined(inputUserId, inputOrderPrice)) {
        if(checkIfFieldsAreEmpty(inputUserId, inputOrderPrice)){
            if(req.headers[headerUserToken] !== undefined){
                connection.query(queryCheckIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    connection.on('error', function(err) {
                        console.log('[MySQL Error]')
                    });
                    console.log('Result : '+result);
                    console.log('Result Json.stringify : '+JSON.stringify(result));
                    console.log('Fields : '+fields);
                    console.log('Fields Json.stringify : '+JSON.stringify(fields));

                    if (result && result.length > 0) {
                        connection.query(queryInsertOrder, [inputUserId, inputOrderPrice], (err, result, fields) => {
                        if(err){
                            console.log('[MySQL Error]' +err);
                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                        } else if (result.insertId){
                            console.log('Rows : '+JSON.stringify(result));
                            res.status(HttpStatus.OK).send('Order Inserted');
                        } else
                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                    });
                    } else {
                        res.status(HttpStatus.BAD_REQUEST).send('Token and userId do not match');
                    }
                });
            } else {
                res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('At least one input is empty');
        }
    } else {
        res.status(HttpStatus.BAD_REQUEST).send('At least one input is not defined')
    }


});

function getConnection() {
    let connection = mysql.createConnection({
        host     : 'localhost',
        user: 'root',
        password : 'password',
        database : 'gram'
    });
    return connection;
}

module.exports = router;