const express = require('express');
const mysql = require('mysql');
const HttpStatus = require('http-status-codes');

const CATEGORIES_TABLE = "categories";
const headerUserToken = 'usertoken';
const queryCheckIfTokenExists = 'SELECT connection_token from utilisateurs where connection_token = ?';
const queryGetCategories = 'SELECT * FROM '+CATEGORIES_TABLE;
const queryGetOneCategory = "SELECT * FROM "+ CATEGORIES_TABLE +" WHERE "+CATEGORIES_TABLE+".id = ?";


const router = express.Router();
let connection = getConnection();


router.get('/category', (req, res) => {

    if (req.headers[headerUserToken] !== undefined) {
        connection.query(queryCheckIfTokenExists, [req.headers[headerUserToken]], function (err, result, fields) {
            connection.on('error', function(err) {
                console.log('[MySQL Error]');
            });
            if (result[0] !== undefined){
                console.log('result[0] is undefined')
                connection.query(queryGetCategories, (err, rows, fields) => {
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
            if (typeof result[0] !== typeof undefined){
                connection.query(queryGetOneCategory, [req.params.categoryId], (err, rows, fields) => {
                    if (err) {
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
                        console.log(err);
                    }
                    else {
                        if(typeof rows[0] === typeof undefined){
                            res.status(HttpStatus.BAD_REQUEST).send('Category ID Not defined');
                        }
                        res.status(HttpStatus.ACCEPTED).send(rows[0]) //If we don't put [0] the returned object is a table containing the object instead of the object itself
                    }
                });
            } else {
                res.status(HttpStatus.BAD_REQUEST).send('Connection token not valid');
            }
        })
    } else {
        res.status(401).send('Authentication Required');
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