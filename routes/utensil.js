const express = require('express');
const mysql = require('mysql');
const HttpStatus = require('http-status-codes');
const headerUserToken = 'usertoken';

const SelectUtensilsFromRecipe = "SELECT id, name from utensil INNER JOIN recipe_utensil ON utensil.id = recipe_utensil.utensil_id where recipe_utensil.recipe_id = ? ";
const SelectRecipe = "SELECT * from recipe where id = ? ";
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

router.get('/utensils/:recipeId', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    let inputRecipeId = req.params.recipeId;

    if (checkIfFieldsAreUndefined(inputUserId, inputRecipeId)) {
        if (checkIfFieldsAreEmpty(inputUserId, inputRecipeId)) {
            if (req.headers[headerUserToken] !== undefined) {
                connection.query(queryCheckIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    connection.on('error', function (err) {
                        console.log('[MySQL Error] : ' + err)
                    });
                    if (result && result.length > 0) {
                        connection.query(SelectRecipe, [inputRecipeId], (err, result, fields) => {
                            connection.on('error', function (err) {
                                console.log('[MySQL Error] : ' + err);
                            });
                            if (err) {
                                console.log('[MySQL Error] : ' + err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            } else if (result && result.length > 0) {
                                connection.query(SelectUtensilsFromRecipe, [inputRecipeId], (err, result, fields) => {
                                    if (err) {
                                        console.log('[MySQL Error] : ' + err);
                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                    } else if (result && result.length > 0) {
                                        console.log('Result : ' + JSON.stringify(result));
                                        res.status(HttpStatus.OK).send(JSON.stringify(result));
                                    } else {
                                        res.status(HttpStatus.BAD_REQUEST).send('This recipe does not have any utensil');
                                    }
                                });
                            } else {
                                res.status(HttpStatus.BAD_REQUEST).send('Recipe id does not match any recipe');
                            }
                            });
                    } else {
                        res.status(HttpStatus.FORBIDDEN).send('Token and userId do not match');
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