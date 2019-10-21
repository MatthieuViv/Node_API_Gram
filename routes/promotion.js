const express = require('express');
const HttpStatus = require('http-status-codes');

const PromotionType = Object.freeze({ "CATEGORY": "CATEGORY", "RECIPE": "RECIPE" });

const router = express.Router();
import {getConnection} from "../helpers/utils";
import {PROMOTIONS_QUERIES} from "../helpers/queries";

//      PUBLIC ROUTES
router.get('/promotions', (req, res) => {
    getConnection.query(PROMOTIONS_QUERIES.selectAllAdmin, (err, result, fields) => {
        if (err) {
            console.error('[MySQL Error] : ' + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
        } else {
            res.status(HttpStatus.OK).send(result);
        }
    });
});

router.get('/promotions/types', (req, res) => {
    let types = [];
    for (var key in PromotionType) {
        types.push(PromotionType[key]);
    }
    res.status(HttpStatus.OK).send(types);
});

//      ADMINISTRATION
router.post('/promotions', (req, res) => {
    let data = req.body;
    switch (data.promotion_type) {
        case PromotionType.CATEGORY:
            if (data.value_type == "€") {
                getConnection.query(PROMOTIONS_QUERIES.insertValueCategoryPromotion, [data.name, data.description, data.promotion_type, data.category_id, data.value], (err, result, f) => {
                    if (err) { console.error(err); return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error"); }
                    res.status(HttpStatus.ACCEPTED).send(true);
                });
            } else if (data.value_type == "%") {
                getConnection.query(PROMOTIONS_QUERIES.insertPercentageCategoryPromotion, [data.name, data.description, data.promotion_type, data.category_id, data.value], (err, result, f) => {
                    if (err) { console.error(err); return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error"); }
                    res.status(HttpStatus.ACCEPTED).send(true);
                });
            }
            break;
        case PromotionType.RECIPE:
            if (data.value_type == "€") {
                getConnection.query(PROMOTIONS_QUERIES.insertValueRecipePromotion, [data.name, data.description, data.promotion_type, data.recipe_id, data.value], (err, result, f) => {
                    if (err) { console.error(err); return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error"); }
                    res.status(HttpStatus.ACCEPTED).send(true);
                });
            } else if (data.value_type == "%") {
                getConnection.query(PROMOTIONS_QUERIES.insertPercentageRecipePromotion, [data.name, data.description, data.promotion_type, data.recipe_id, data.value], (err, result, f) => {
                    if (err) { console.error(err); return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error"); }
                    res.status(HttpStatus.ACCEPTED).send(true);
                });
            }
            break;
    }
});

router.delete('/promotions/:promotionsId', (req, res) => {
    getConnection.query(PROMOTIONS_QUERIES.delete, [req.params.promotionsId], (err, resultRemove, fields) => {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal server Error");
            console.error(err);
        }
        else {
            res.status(HttpStatus.ACCEPTED).send("ok");
        }
    });
});

module.exports = router;
