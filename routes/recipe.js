const express = require('express');
const file = require("../helpers/file.js");
const HttpStatus = require('http-status-codes');
const tokenChecker = require("../helpers/tokenChecker.js");

const headerUserToken = 'usertoken';

import {getConnection, checkIfFieldsAreUndefined, checkIfFieldsAreEmpty} from "../helpers/utils";
import {USER_QUERIES, RECIPE_QUERIES} from "../helpers/queries";
const router = express.Router();


router.get('/recipes', (req, res) => {
    getConnection.query(RECIPE_QUERIES.selectAllRecipe, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
        }
        else {
            res.status(HttpStatus.ACCEPTED).send(result);
        }
    });
});

router.get('/recipes/category/:categoryId/filtered', (req, res) => {
    let IDs = JSON.parse(req.query.IDs);
    const categoryId = req.params.categoryId;
    getConnection.query(RECIPE_QUERIES.selectFilteredRecipe, [categoryId, IDs, IDs.length], (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
        }
        else {
            res.status(HttpStatus.ACCEPTED).send(JSON.stringify(result));
        }
    });

});

router.post('/recipe', (req, res) => {
    file.uploadCarousel(req, function (err, fields) {
        if (err) { console.error(err); return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error"); }
        getConnection.query(RECIPE_QUERIES.insert, [fields.name, fields.category, fields.description, fields.price, fields.video_id, fields.imageIDs[0]], (err, result, f) => {
            if (err) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
                console.error(err);
            }
            else {
                const recipe_id = result.insertId;
                const steps = Object.keys(fields)
                    .filter(key => key.includes("step"))
                    .reduce((obj, key) => {
                        let splited = key.split("_");
                        let i = splited[2] - 1;
                        if (!obj[i]) {
                            obj[i] = [recipe_id, i + 1];
                        }
                        obj[i].push(fields[key]);
                        return obj;
                    }, []);
                //////////////////

                getConnection.query(RECIPE_QUERIES.insertRecipe_instructions, [steps], (err, result, f) => {
                    if (err) {
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
                        console.error(err);
                    }
                    else {

                        const ingredients = Object.keys(fields)
                            .filter(key => key.includes("ingredient"))
                            .reduce((obj, key) => {
                                let splited = key.split("_");
                                let i = splited[2] - 1;
                                if (!obj[i]) {
                                    obj[i] = [recipe_id];
                                }
                                obj[i].push(fields[key]);
                                return obj;
                            }, []);

                        getConnection.query(RECIPE_QUERIES.insertRecipe_ingredients, [ingredients], (err, result, f) => {
                            if (err) {
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
                                console.error(err);
                            }
                            else {

                                const pictures = fields.imageIDs.reduce((obj, id) => {
                                    obj.push([recipe_id, id]);
                                    return obj;
                                }, []);

                                getConnection.query(RECIPE_QUERIES.insertRecipe_pictures, [pictures], (err, result, f) => {
                                    if (err) {
                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
                                        console.error(err);
                                    }
                                    else {

                                        const utensils = Object.keys(fields)
                                            .filter(key => key.includes("utensil"))
                                            .reduce((obj, key) => {
                                                obj.push([recipe_id, fields[key]]);
                                                return obj;
                                            }, []);

                                        getConnection.query(RECIPE_QUERIES.insertRecipe_utensils, [utensils], (err, result, f) => {
                                            if (err) {
                                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
                                                console.error(err);
                                            }
                                            else {
                                                const filters = Object.keys(fields)
                                                    .filter(key => key.includes("filters"))
                                                    .reduce((obj, key) => {
                                                        obj.push([recipe_id, fields[key]]);
                                                        return obj;
                                                    }, []);
                                                getConnection.query(RECIPE_QUERIES.insertRecipe_filters, [utensils], (err, result, f) => {
                                                    if (err) {
                                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
                                                        console.error(err);
                                                    }
                                                    else {
                                                        res.status(HttpStatus.ACCEPTED).send(true);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});

router.delete('/recipe/:recipeId', (req, res) => {
    getConnection.query(RECIPE_QUERIES.select, [req.params.recipeId], (err, result, fields) => {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
            console.log(err);
        }
        else if (result.length === 0) {
            res.status(HttpStatus.BAD_REQUEST).send('Category ID Not defined');
        } else {
            getConnection.query(RECIPE_QUERIES.delete, [req.params.recipeId], (err, resultRemove, fields) => {
                if (err) {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
                    console.error(err);
                }
                else {
                    file.removeFolder("/recipes_carousel/" + result[0].name);
                    res.status(HttpStatus.ACCEPTED).send("ok");
                }
            });
        }
    });
});

router.get('/recipes/byNameAndId', (req, res) => {
    getConnection.query(RECIPE_QUERIES.selectRecipeNameID, (err, result, fields) => {
        console.log(result);
        if (err) {
            console.log(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
        }
        else if (result && result.length > 0) {
            res.status(HttpStatus.ACCEPTED).send(result);
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('RecipeId do not match any recipe');
        }
    });
});

router.get('/recipes/:recipeId', (req, res) => {
    getConnection.query(RECIPE_QUERIES.select, [req.params.recipeId], (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
        }
        else if (result && result.length > 0) {
            res.status(HttpStatus.ACCEPTED).send(JSON.stringify(result[0]))
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('RecipeId do not match any recipe');
        }
    });
});

router.get('/recipes/category/:categoryId', (req, res) => {
    getConnection.query(RECIPE_QUERIES.selectRecipePerCategory, [req.params.categoryId], (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
        }
        else if (result && result.length > 0) {
            res.status(HttpStatus.ACCEPTED).send(JSON.stringify(result))
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('CategoryId do not match any recipe');
        }
    });
});

router.get('/recipes/user/like/:userId', (req, res) => {
    getConnection.query(RECIPE_QUERIES.selectUserLikedRecipes, [req.params.userId], function (err, result, fields) {
        getConnection.on('error', function (err) {
            console.log('[MySQL ERROR] : ' + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
        });
        if (result && result.length > 0) {
            res.status(HttpStatus.OK).send(JSON.stringify(result));
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Problem with the query');
        }
    });
});

router.post('/recipes/user/like/:recipeId', tokenChecker(getConnection), (req, res) => {

    const params = req.params;
    const recipeId = params.recipeId;
    const userId = res.locals.userInfo.id;

    if (!(checkIfFieldsAreEmpty(recipeId, userId) && checkIfFieldsAreUndefined(recipeId, userId))) {
        return res.status(HttpStatus.BAD_REQUEST).send('At least one input is empty');
    }

    getConnection.query(RECIPE_QUERIES.select, [recipeId], (err, result, fields) => { //Checking if the recipe is in the database
        if (err) {
            console.log('[MySQL Error]' + err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
        }
        if (!(result && result.length > 0)) return res.status(HttpStatus.BAD_REQUEST).send('Recipe id does not match any recipe');

        getConnection.query(RECIPE_QUERIES.checkIfRecipeIsAlreadyLiked, [userId, recipeId], (err, result, fields) => {
            if (err) {
                console.log('[MySQL Error]' + err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
            } else if (result && result.length > 0) { //If there is a result to the request
                getConnection.query(RECIPE_QUERIES.deleteLikedRecipe, [userId, recipeId], (err, result, fields) => {
                    if (err) {
                        console.error('[MySQL Error]' + err);
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                    }
                    res.status(HttpStatus.OK).send('Recipe removed from like');
                });
            } else { //If there is no result we insert the row in the table
                getConnection.query(RECIPE_QUERIES.insertLikedRecipe, [userId, recipeId], (err, result, fields) => {
                    if (err) {
                        console.error('[MySQL Error]' + err);
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                    }
                    res.status(HttpStatus.OK).send('Recipe inserted inserted in like');
                });
            }
        });
    });
});

router.post('/recipes/user/dislike/:userId', (req, res) => {

    let post_data = req.body;
    let inputUserId = req.params.userId;
    let inputRecipeId = post_data.inputRecipeId;

    if (checkIfFieldsAreEmpty(inputRecipeId, inputUserId) && checkIfFieldsAreUndefined(inputRecipeId, inputUserId)) {
        if (req.headers[headerUserToken] !== undefined) {
            getConnection.query(USER_QUERIES.checkIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                getConnection.on('error', function (err) {
                    console.log('[MySQL Error]', +err)
                });
                if (result && result.length > 0) { //IF the getConnection token matches the user id
                    getConnection.query(RECIPE_QUERIES.select, [inputRecipeId], (err, result, fields) => { //Checking if the recipe is in the database
                        getConnection.on('error', function (err) {
                            console.log('[MySQL Error]' + err);
                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                        });
                        if (result && result.length > 0) {
                            getConnection.query(RECIPE_QUERIES.checkIfRecipeIsAlreadyDisliked, [inputUserId, inputRecipeId], (err, result, fields) => {
                                if (err) {
                                    console.log('[MySQL Error]' + err);
                                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');

                                } else if (result && result.length > 0) { //If there is a result to the request
                                    res.status(HttpStatus.BAD_REQUEST).send('Recipe is already Disliked');

                                } else { //If there is no result we insert the row in the table
                                    console.log('Query to Insert the recipe to the database');
                                    getConnection.query(RECIPE_QUERIES.insertDislikedRecipe, [inputUserId, inputRecipeId], (err, result, fields) => {
                                        if (err) {
                                            console.log('[MySQL Error]' + err);
                                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                        } else if (result.affectedRows) { //If this field is present it means the row was inserted. We tested .affectedRows and not .insertId because this table does not have an id column, so it can't be returned by the sql database
                                            console.log('Rows : ' + JSON.stringify(result));
                                            console.log('Should Remove the recipe from the dislikes');
                                            getConnection.query(RECIPE_QUERIES.deleteDislikedRecipe, [inputUserId, inputRecipeId], (err, result, fields) => {
                                                getConnection.on('error', function (err) {
                                                    console.log('[MySQL Error]', +err);
                                                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                                });
                                                if (result.affectedRows) {
                                                    res.status(HttpStatus.OK).send('Recipe inserted in the Dislike table and remove from the liked table');
                                                } else {
                                                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                                }
                                            });
                                        } else {
                                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                        }
                                    });
                                }
                            });
                        } else {
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
});

module.exports = router;
