const express = require('express');
const HttpStatus = require('http-status-codes');
const file = require("../helpers/file");

const router = express.Router();
import {getConnection} from '../helpers/utils';
import {CATEGORY_QUERIES} from "../helpers/queries";

//       PUBLIC ROUTES
router.get('/category', (req, res) => {
    getConnection.query(CATEGORY_QUERIES.selectAll, (err, rows, fields) => {
        if (err) {
            console.error(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
        }
        res.status(HttpStatus.ACCEPTED).send(rows)
    });
});

router.get('/category/:categoryId', (req, res) => {
    getConnection.query(CATEGORY_QUERIES.select, [req.params.categoryId], (err, result, fields) => {
        if (err) {
            console.error(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
        }
        else if (result.length === 0) {
            return res.status(HttpStatus.BAD_REQUEST).send('Category ID Not defined');
        }
        res.status(HttpStatus.ACCEPTED).send(result[0]) //If we don't put [0] the returned object is a table containing the object instead of the object itself
    });
});

//      ADMIN ROUTES
router.post('/category', (req, res) => {
    file.upload(req, "categories", function (err, fields) {
        if (err) { console.error(err); return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error"); }
        getConnection.query(CATEGORY_QUERIES.insert, [fields.name, fields.imageID], (err, result, fields) => {
            if (err) {
                console.error(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
            }
            res.status(HttpStatus.ACCEPTED).send(result)
        });
    });
});

router.delete('/category/:categoryId', (req, res) => {
    getConnection.query(CATEGORY_QUERIES.select, [req.params.categoryId], (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
        }
        if (result.length === 0) {
            return res.status(HttpStatus.BAD_REQUEST).send('Category ID Not defined');
        }
        getConnection.query(CATEGORY_QUERIES.delete, [req.params.categoryId], (err, resultRemove, fields) => {
            if (err) {
                console.error(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
            }
            file.remove("/categories/" + result[0].image_id + ".png", (err, result) => {
                if (err) {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
                    console.error(err);
                } else {
                    res.status(HttpStatus.ACCEPTED).send("ok");
                }
            });
        });
    });
});

module.exports = router;
