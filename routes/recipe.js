const express = require('express');
const mysql = require('mysql');
const HttpStatus = require('http-status-codes');
const headerUserToken = 'usertoken';
const RECIPE_TABLE = "recipe";
const ID = "id";
const RECIPE_TABLE_CATEGORY_ID = "category_id";
const USER_LIKE_TABLE = "user_like";
const USER_LIKE_TABLE_USER_ID = "user_id";
const USER_LIKE_TABLE_RECIPE_ID = "recipe_id";
const USER_DISLIKE_TABLE = "user_dislike";
const USER_DISLIKE_TABLE_USER_ID = "user_id";
const USER_DISLIKE_TABLE_RECIPE_ID = "recipe_id";


const queryCheckIfTokenExistsAndCorrespondsToUser = 'SELECT id, connection_token from user where connection_token = ? AND id=?';
const queryCheckIfTokenExists = 'SELECT connection_token from user where connection_token = ?';
const SelectRecipe = "SELECT * FROM "+ RECIPE_TABLE +" WHERE "+ID+" = ?";
const querySelectRecipePerCategory = "SELECT * FROM "+ RECIPE_TABLE +" WHERE "+RECIPE_TABLE_CATEGORY_ID+" = ?";
const querySelectLikedRecipesOfUser = "SELECT * FROM "+ RECIPE_TABLE +" WHERE "+RECIPE_TABLE+".id = ?";

// const queryCheckIfRecipeIsAlreadyLiked = "SELECT * from "+USER_LIKE_TABLE+" WHERE user_id = ? AND recipe_id = ?";
const CheckIfRecipeIsAlreadyLiked = "SELECT * from "+USER_LIKE_TABLE+" WHERE " +USER_LIKE_TABLE_USER_ID+" = ? AND "+USER_LIKE_TABLE_RECIPE_ID+" = ?";
const InsertLikedRecipe = "INSERT INTO "+USER_LIKE_TABLE+" ("+USER_LIKE_TABLE_USER_ID+","+USER_LIKE_TABLE_RECIPE_ID+") VALUES (?,?)";
const DeleteLikedRecipe = "DELETE FROM "+USER_LIKE_TABLE+" WHERE "+USER_LIKE_TABLE_USER_ID+" = ? AND "+USER_LIKE_TABLE_RECIPE_ID+" = ?";
const SelectDislikedRecipesOfUser = "SELECT * FROM "+ RECIPE_TABLE +" WHERE "+RECIPE_TABLE+".id = ?";
const CheckIfRecipeIsAlreadyDisliked = "SELECT * from "+USER_DISLIKE_TABLE+" WHERE " +USER_DISLIKE_TABLE_USER_ID+" = ? AND "+USER_DISLIKE_TABLE_RECIPE_ID+" = ?";
const InsertDislikedRecipe = "INSERT INTO "+USER_DISLIKE_TABLE+" ("+USER_DISLIKE_TABLE_USER_ID+","+USER_DISLIKE_TABLE_RECIPE_ID+") VALUES (?,?)";
const DeleteDislikedRecipe = "DELETE FROM "+USER_DISLIKE_TABLE+" WHERE "+USER_DISLIKE_TABLE_USER_ID+" = ? AND "+USER_DISLIKE_TABLE_RECIPE_ID+" = ?";
const SelectUserLikedRecipes = "SELECT id, category_id, name, description, price, picture_id, video_id FROM "+ RECIPE_TABLE+" INNER JOIN user_like ON recipe.id = user_like.recipe_id WHERE user_like.user_id = ?";
// let queryString = "SELECT ustensiles.id, ustensiles.nom FROM "+ UTENSILS_TABLE +" JOIN "+RECIPE_UTENSILS_TABLE+" ON ustensiles.id = "+ RECIPE_UTENSILS_TABLE+".ustensiles_id JOIN "+ RECIPE_TABLE+" ON "+RECIPE_UTENSILS_TABLE+".recettes_id = "+RECIPE_TABLE+".id WHERE "+RECIPE_TABLE+".id = ?";

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

router.get('/recipes/:recipeId', (req, res) => {

    if (req.headers[headerUserToken] !== undefined) {
        connection.query(queryCheckIfTokenExists, [req.headers[headerUserToken]], function (err, result, fields) {
            connection.on('error', function(err) {
                console.log('[MySQL Error] : ', err);
            });
            console.log(JSON.stringify(result[0]))
            if (result && result.length > 0){
                connection.query(SelectRecipe, [req.params.recipeId], (err, result, fields) => {
                    if (err) {
                        console.log(err);
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
                    }
                    else if(result && result.length > 0){
                        res.status(HttpStatus.ACCEPTED).send(JSON.stringify(result[0]))
                    } else {
                        res.status(HttpStatus.BAD_REQUEST).send('RecipeId do not match any recipe');
                    }
                });
            } else {
                res.status(HttpStatus.UNAUTHORIZED).send('Connection token not valid');
            }
        })
    } else {
        res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
    }
});

router.get('/recipes/category/:categoryId', (req, res) => {
    if (req.headers[headerUserToken] !== undefined) {
        connection.query(queryCheckIfTokenExists, [req.headers[headerUserToken]], function (err, result, fields) {
            connection.on('error', function(err) {
                console.log('[MySQL Error] : ', err);
            });
            console.log(JSON.stringify(result[0]))
            if (result && result.length > 0){
                connection.query(querySelectRecipePerCategory, [req.params.categoryId], (err, result, fields) => {
                    if (err) {
                        console.log(err);
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
                    }
                    else if(result && result.length > 0){
                        res.status(HttpStatus.ACCEPTED).send(JSON.stringify(result[0]))
                    } else {
                        res.status(HttpStatus.BAD_REQUEST).send('CategoryId do not match any recipe');
                    }
                });
            } else {
                res.status(HttpStatus.UNAUTHORIZED).send('Connection token not valid');
            }
        })
    } else {
        res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
    }
});

router.get('/recipes/user/liked/:userId', (req, res) => {
    connection.query(SelectUserLikedRecipes, [req.params.userId], function (err, result, fields) {
        connection.on('error', function (err){
            console.log('[MySQL ERROR] : '+ err);
        });
        if (result && result.length > 0){
            res.status(HttpStatus.OK).send(JSON.stringify(result));
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Problem with the query');
        }
    })
});

router.post('/recipes/user/like/:userId', (req, res) => {

    let post_data = req.body;
    let inputUserId = req.params.userId;
    let inputRecipeId = post_data.inputRecipeId;

    if (checkIfFieldsAreUndefined(inputRecipeId, inputUserId)) {
        if(checkIfFieldsAreEmpty(inputRecipeId, inputUserId)){
            if(req.headers[headerUserToken] !== undefined){
                connection.query(queryCheckIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    connection.on('error', function(err) {
                        console.log('[MySQL Error]', +err)
                    });
                    if (result && result.length > 0) { //IF the connection token matches the user id
                        connection.query(SelectRecipe, [inputRecipeId], (err, result, fields) => { //Checking if the recipe is in the database
                            connection.on('error', function(err) {
                                console.log('[MySQL Error]' +err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            });
                            if (result && result.length >0){
                                connection.query(CheckIfRecipeIsAlreadyLiked, [inputUserId, inputRecipeId], (err, result, fields) => {
                                    if(err){
                                        console.log('[MySQL Error]' +err);
                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');

                                    } else if( result && result.length >0){ //If there is a result to the request
                                        res.status(HttpStatus.BAD_REQUEST).send('Recipe is already Liked');

                                    } else { //If there is no result we insert the row in the table
                                        console.log('Query to Insert the recipe to the database');
                                        connection.query(InsertLikedRecipe, [inputUserId, inputRecipeId], (err, result, fields) => {
                                            if(err){
                                                console.log('[MySQL Error]' +err);
                                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                            } else if (result.affectedRows){ //If this field is present it means the row was inserted. We tested .affectedRows and not .insertId because this table does not have an id column, so it can't be returned by the sql database
                                                console.log('Rows : '+JSON.stringify(result));
                                                console.log('Should Remove the recipe from the dislikes');
                                                connection.query(DeleteDislikedRecipe, [inputUserId, inputRecipeId], (err, result, fields) => {
                                                    connection.on('error', function(err){
                                                        console.log('[MySQL Error]', +err)
                                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                                    });
                                                    if(result.affectedRows){
                                                        res.status(HttpStatus.OK).send('Recipe Inserted in the like table and remove from the disliked table');
                                                    } else {
                                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Recipe Inserted and was not present in the dislike table');
                                                    }
                                                });
                                            } else {
                                                /*console.log('Result: ' + result);
                                                console.log('Result stringify : ' + JSON.stringify(result));*/
                                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                            }
                                        });
                                    }
                                });
                            } else{
                                res.status(HttpStatus.BAD_REQUEST).send('Recipe id does not match any recipe');
                            }
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

router.get('/recipes/user/disliked/:userId', (req, res) => {
});

router.post('/recipes/user/dislike/:userId', (req, res) => {

    let post_data = req.body;
    let inputUserId = req.params.userId;
    let inputRecipeId = post_data.inputRecipeId;

    if (checkIfFieldsAreUndefined(inputRecipeId, inputUserId)) {
        if(checkIfFieldsAreEmpty(inputRecipeId, inputUserId)){
            if(req.headers[headerUserToken] !== undefined){
                connection.query(queryCheckIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    connection.on('error', function(err) {
                        console.log('[MySQL Error]', +err)
                    });
                    if (result && result.length > 0) { //IF the connection token matches the user id
                        connection.query(SelectRecipe, [inputRecipeId], (err, result, fields) => { //Checking if the recipe is in the database
                            connection.on('error', function(err) {
                                console.log('[MySQL Error]' +err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            });
                            if (result && result.length >0){
                                connection.query(CheckIfRecipeIsAlreadyDisliked, [inputUserId, inputRecipeId], (err, result, fields) => {
                                    if(err){
                                        console.log('[MySQL Error]' +err);
                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');

                                    } else if( result && result.length >0){ //If there is a result to the request
                                        res.status(HttpStatus.BAD_REQUEST).send('Recipe is already Disliked');

                                    } else { //If there is no result we insert the row in the table
                                        console.log('Query to Insert the recipe to the database');
                                        connection.query(InsertDislikedRecipe, [inputUserId, inputRecipeId], (err, result, fields) => {
                                            if(err){
                                                console.log('[MySQL Error]' +err);
                                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                            } else if (result.affectedRows){ //If this field is present it means the row was inserted. We tested .affectedRows and not .insertId because this table does not have an id column, so it can't be returned by the sql database
                                                console.log('Rows : '+JSON.stringify(result));
                                                console.log('Should Remove the recipe from the dislikes');
                                                connection.query(DeleteLikedRecipe, [inputUserId, inputRecipeId], (err, result, fields) => {
                                                    connection.on('error', function(err){
                                                        console.log('[MySQL Error]', +err)
                                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                                    });
                                                    if(result.affectedRows){
                                                        res.status(HttpStatus.OK).send('Recipe inserted in the Dislike table and remove from the liked table');
                                                    } else {
                                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                                    }
                                                });
                                            } else {
                                                /*console.log('Result: ' + result);
                                                console.log('Result stringify : ' + JSON.stringify(result));*/
                                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                            }
                                        });
                                    }
                                });
                            } else{
                                res.status(HttpStatus.BAD_REQUEST).send('Recipe id does not match any recipe');
                            }
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