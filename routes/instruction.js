const express = require('express');
const HttpStatus = require('http-status-codes');

const router = express.Router();
import {getConnection} from "../helpers/utils";
import {INSTRUCTION_QUERIES} from "../helpers/queries";

router.get('/instructions/:recipeId', (req, res) => {

    let inputRecipeId = req.params.recipeId;

    getConnection.query(INSTRUCTION_QUERIES.selectRecipe, [inputRecipeId], (err, result, fields) => {
        if (err) {
            console.log('[MySQL Error] : ' + err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
        }
        if (!(result && result.length > 0)) {
            return res.status(HttpStatus.BAD_REQUEST).send('RecipeId does not match any recipe');
        }
        getConnection.query(INSTRUCTION_QUERIES.selectInstructionsFromRecipe, [inputRecipeId], (err, result, fields) => {
            if (err) {
                console.log('[MySQL Error] : ' + err);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
            } else if (result && result.length > 0) {
                console.log('Result : ' + JSON.stringify(result));
                res.status(HttpStatus.OK).send(JSON.stringify(result));
            } else {
                res.status(HttpStatus.BAD_REQUEST).send('This Recipe does not have any instruction');
            }
        });
    });
});

module.exports = router;
