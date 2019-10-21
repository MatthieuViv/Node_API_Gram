const express = require('express');
const mysql = require('mysql');
const HttpStatus = require('http-status-codes');

const querySelectImages = "SELECT picture_id FROM " + "recipe_pictures" + " WHERE " + "recipe_id" + " = ?";

const router = express.Router();
import {getConnection} from "../helpers/utils";

router.get('/images/:id', (req, res) => {
    getConnection.query(querySelectImages, [req.params.id], (err, result, fields) => {
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
