const express = require('express');
const mysql = require('mysql');
const HttpStatus = require('http-status-codes');


const CATEGORY_TABLE = "category";
const headerUserToken = 'usertoken';

const queryCheckIfTokenExists = 'SELECT connection_token from user where connection_token = ?';
const querySelectAllCategories = 'SELECT * FROM ' + CATEGORY_TABLE;
const querySelectCategory = "SELECT * FROM " + CATEGORY_TABLE +" WHERE "+CATEGORY_TABLE+".id = ?";

const router = express.Router();
import {getConnection} from '../Utils/Helper';
let connection = getConnection();



router.get('/category', (req, res) => {

    if (req.headers[headerUserToken] !== undefined) {
        connection.query(queryCheckIfTokenExists, [req.headers[headerUserToken]], function (err, result, fields) {
            connection.on('error', function(err) {
                console.log('[MySQL Error] : ', err);
            });
            if (result !== undefined){
                console.log('result[0] is undefined')
                connection.query(querySelectAllCategories, (err, rows, fields) => {
                    if (err) {
                        console.log(err);
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
                    }
                    else {
                        console.log('Request ACCEPTED');
                        res.status(HttpStatus.ACCEPTED).send(rows)
                    }
                });
            } else {
                res.status(HttpStatus.BAD_REQUEST).send('Connection token not valid');
            }
        })
    } else {
        console.log('Authentication Required');
        res.status(401).send('Authentication Required');
    }
});

router.get('/category/:categoryId', (req, res) => {

    console.log(req.body);

    if (req.headers[headerUserToken] !== undefined) {
        connection.query(queryCheckIfTokenExists, [req.headers[headerUserToken]], function (err, result, fields) {
            connection.on('error', function(err) {
                console.log('[MySQL Error]');
            });
            if (result.length >0 ){
                connection.query(querySelectCategory, [req.params.categoryId], (err, result, fields) => {
                    if (err) {
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
                        console.log(err);
                    }
                    else if (result.length === 0){
                        console.log('Result : '+result);
                        console.log('Result Json.stringify : '+JSON.stringify(result));
                        console.log('Fields : '+fields);
                        console.log('Fields Json.stringify : '+JSON.stringify(fields));
                        res.status(HttpStatus.BAD_REQUEST).send('Category ID Not defined');
                    } else {
                        console.log('Rows : '+JSON.stringify(result));
                        console.log('Fields : '+JSON.stringify(fields));
                        res.status(HttpStatus.ACCEPTED).send(result[0]) //If we don't put [0] the returned object is a table containing the object instead of the object itself
                    }
                });
            } else {
                res.status(HttpStatus.BAD_REQUEST).send('Connection token not valid');
            }
        });

    } else {
        res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
    }

});

/*
function getConnection() {
    let connection = mysql.createConnection({
        host     : 'localhost',
        user: 'root',
        password : 'password',
        database : 'gram'
    });
    return connection;
}
*/


module.exports = router;
