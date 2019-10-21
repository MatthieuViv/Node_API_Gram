const express = require('express');
const HttpStatus = require('http-status-codes');


const querySelectFilter = "SELECT * from filter";
const querySelectFilterRecipe = "SELECT name FROM recipe_filter INNER JOIN filter ON filter_id = id WHERE recipe_id = ?";

const router = express.Router();
import {getConnection} from "../helpers/utils";

router.get('/filters', (req, res) => {
    getConnection.query(querySelectFilter, (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
        }
        else {
            res.status(HttpStatus.ACCEPTED).send(result);
        }
    });
});

router.get('/filters/:recipeId', (req, res) => {
    getConnection.query(querySelectFilterRecipe, [req.params.recipeId], (err, result, fields) => {
        if (err) {
            console.log(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
        }
        else {
            res.status(HttpStatus.ACCEPTED).send(result);
        }
    });
});

module.exports = router;
