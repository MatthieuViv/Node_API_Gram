const express = require('express');
const mysql = require('mysql');
const HttpStatus = require('http-status-codes');
const headerUserToken = 'usertoken';
const ORDERS_TABLE = "orders";
const ORDERS_RECIPE_TABLE = "orders_recipe";

const queryCheckIfTokenExistsAndCorrespondsToUser = 'SELECT id, connection_token from user where connection_token = ? AND id=?';
let queryAllOrdersFromUser = "SELECT * FROM "+ ORDERS_TABLE +" WHERE "+ORDERS_TABLE+".user_id = ?";
let queryInsertOrder = "INSERT INTO "+ ORDERS_TABLE +"(order_datetime, delivery_datetime, user_id, price, status_id) VALUES (NOW(), NOW(), ?, ?, '1')";

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

router.get('/orders/users/:userId', (req, res) => {

    if(req.headers[headerUserToken] !== undefined){
        connection.query(queryAllOrdersFromUser, [req.params.userId], (err, rows, fields) => {
            if (err) {
                console.log(err);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
            } else {
                console.log('Query done');
                res.status(HttpStatus.OK).send(rows);
            }
        });
    } else {
        res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
    }


});

router.post('/orders/users/', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    let inputOrderPrice = post_data.inputOrderPrice;

    if (checkIfFieldsAreUndefined(inputUserId, inputOrderPrice)) {
        if(checkIfFieldsAreEmpty(inputUserId, inputOrderPrice)){
            console.log('fields are ok')
            if(req.headers[headerUserToken] !== undefined){
                connection.query(queryCheckIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    connection.on('error', function(err) {
                        console.log('[MySQL Error]')
                    });
                    console.log('Result : '+result);
                    console.log('Result Json.stringify : '+JSON.stringify(result));
                    console.log('Fields : '+fields);
                    console.log('Fields Json.stringify : '+JSON.stringify(fields));

                    if (result && result.length > 0) {connection.query(queryInsertOrder, [inputUserId, inputOrderPrice], (err, result, fields) => {
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