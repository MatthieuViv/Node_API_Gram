const express = require('express');
const HttpStatus = require('http-status-codes');
const router = express.Router();

//Import Utility functions
import {getConnection} from "../helpers/utils";
import {INGREDIENT_QUERIES} from "../helpers/queries";

//      PUBLIC ROUTES
router.get('/ingredients', (req, res) => {
    getConnection.query(INGREDIENT_QUERIES.selectAll, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
        }
        else {
            res.status(HttpStatus.ACCEPTED).send(result);
        }
    });
});

router.get('/ingredients/:recipeId', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    let inputRecipeId = req.params.recipeId;

    getConnection.query(INGREDIENT_QUERIES.selectRecipe, [inputRecipeId], (err, result, fields) => {
        getConnection.on('error', function (err) {
            console.log('[MySQL Error] : ' + err);
        });
        if (err) {
            console.log('[MySQL Error] : ' + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
        } else if (result && result.length > 0) {
            getConnection.query(INGREDIENT_QUERIES.selectIngredientsFromRecipe, [inputRecipeId], (err, result, fields) => {
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
            res.status(HttpStatus.BAD_REQUEST).send('Recipe id does not match any recipe');
        }
    });
});

module.exports = router;
