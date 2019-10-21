const express = require('express');
const HttpStatus = require('http-status-codes');

const router = express.Router();

import {getConnection} from "../helpers/utils";
import {UTENSIL_QUERIES} from "../helpers/queries";

router.get('/utensil', (req, res) => {
    getConnection.query(UTENSIL_QUERIES.querySelectAllUtensil, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
        }
        else {
            res.status(HttpStatus.ACCEPTED).send(result);
        }
    });
});

router.get('/utensils/:recipeId', (req, res) => {
    let inputRecipeId = req.params.recipeId;

    getConnection.query(UTENSIL_QUERIES.selectRecipe, [inputRecipeId], (err, result, fields) => {
        if (err) {
            console.log('[MySQL Error] : ' + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
        } else if (result && result.length > 0) {
            getConnection.query(UTENSIL_QUERIES.selectUtensilsFromRecipe, [inputRecipeId], (err, result, fields) => {
                if (err) {
                    console.log('[MySQL Error] : ' + err);
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                } else if (result && result.length > 0) {
                    res.status(HttpStatus.OK).send(JSON.stringify(result));
                } else {
                    res.status(HttpStatus.BAD_REQUEST).send('This recipe does not have any utensil');
                }
            });
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('Recipe id does not match any recipe');
        }
    });
});

module.exports = router;
