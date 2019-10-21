const express = require('express');
const HttpStatus = require('http-status-codes');
const headerUserToken = 'usertoken';

import {getConnection, checkIfFieldsAreEmpty, checkIfFieldsAreUndefined} from "../helpers/utils";
import {USER_QUERIES, ORDER_QUERIES} from "../helpers/queries";


const router = express.Router();

router.get('/orders/user/:userId', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    inputUserId = req.params.userId;

    console.log(req.params.userId);
    if (checkIfFieldsAreUndefined(inputUserId)) {
        if (checkIfFieldsAreEmpty(inputUserId)) {
            if (req.headers[headerUserToken] !== undefined) {
                getConnection.query(USER_QUERIES.checkIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    getConnection.on('error', function(err) {
                        console.log('[MySQL Error]')
                    });
                    if (result && result.length > 0) {
                        getConnection.query(ORDER_QUERIES.selectAllOrdersFromUser, [inputUserId], (err, result, fields) => {
                            if(err){
                                console.log('[MySQL Error]' +err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            } else if (result && result.length > 0){
                                console.log('Result : '+JSON.stringify(result));
                                res.status(HttpStatus.OK).send(JSON.stringify(result));
                            } else
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                        });
                    } else {
                        res.status(HttpStatus.BAD_REQUEST).send('Token and userId do not match');
                    }
                });
            }else {
                res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('At least one input is empty');
        }
    } else {
        res.status(HttpStatus.BAD_REQUEST).send('At least one input is not defined')
    }

});

router.get('/orders/:orderId', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    let inputOrderId = req.params.orderId;

    console.log(inputOrderId);
    console.log(inputUserId);

    if (checkIfFieldsAreUndefined(inputUserId, inputOrderId)) {
        if (checkIfFieldsAreEmpty(inputUserId, inputOrderId)) {
            if (req.headers[headerUserToken] !== undefined) {
                getConnection.query(USER_QUERIES.checkIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    getConnection.on('error', function(err) {
                        console.log('[MySQL Error] : '+err)
                    });
                    if (result && result.length > 0) {
                        getConnection.query(ORDER_QUERIES.select, [inputOrderId, inputUserId], (err, result, fields) => {
                            if(err){
                                console.log('[MySQL Error] : '+err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            } else if (result && result.length > 0){
                                console.log('Result : '+JSON.stringify(result));
                                res.status(HttpStatus.OK).send(JSON.stringify(result));
                            } else
                                res.status(HttpStatus.BAD_REQUEST).send('userId and orderId do not match');
                        });
                    } else {
                        res.status(HttpStatus.BAD_REQUEST).send('Token and userId do not match');
                    }
                });
            }else {
                res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('At least one input is empty');
        }
    } else {
        res.status(HttpStatus.BAD_REQUEST).send('At least one input is not defined')
    }

});

router.post('/orders/users/', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    let inputOrderPrice = post_data.inputOrderPrice;

    if (checkIfFieldsAreUndefined(inputUserId, inputOrderPrice)) {
        if(checkIfFieldsAreEmpty(inputUserId, inputOrderPrice)){
            if(req.headers[headerUserToken] !== undefined){
                getConnection.query(USER_QUERIES.checkIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    getConnection.on('error', function(err) {
                        console.log('[MySQL Error] : '+err);
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                    });
                    if (result && result.length > 0) {
                        getConnection.query(ORDER_QUERIES.insert, [inputUserId, inputOrderPrice], (err, result, fields) => {
                            if(err){
                                console.log('[MySQL Error]' +err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            } else if (result.insertId){
                                console.log('Rows : '+JSON.stringify(result));
                                res.status(HttpStatus.OK).send('Order Inserted');
                            } else {
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
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

router.get('/orders/recipes/:orderId', (req, res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    let inputOrderId = req.params.orderId;

    if (checkIfFieldsAreUndefined(inputUserId, inputOrderId)) {
        if (checkIfFieldsAreEmpty(inputUserId, inputOrderId)) {
            if (req.headers[headerUserToken] !== undefined) {
                getConnection.query(USER_QUERIES.checkIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    getConnection.on('error', function(err) {
                        console.log('[MySQL Error] : '+err)
                    });
                    if (result && result.length > 0) {
                        getConnection.query(ORDER_QUERIES.select, [inputOrderId, inputUserId], (err, result, fields) => {
                            if(err){
                                console.log('[MySQL Error] : '+err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            } else if (result && result.length > 0){
                                console.log('Result : '+JSON.stringify(result));
                                getConnection.query(ORDER_QUERIES.selectRecipesOfOrder, [inputOrderId], (err, result, fields) => {
                                    getConnection.on('error', function(err){
                                        console.log('[MySQL Error] : '+err);
                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                    });
                                    if(result && result.length >0){
                                        res.status(HttpStatus.OK).send(JSON.stringify(result));
                                    } else {
                                        res.status(HttpStatus.BAD_REQUEST).send('Problem with the Request');
                                    }
                                });
                            } else {
                                res.status(HttpStatus.BAD_REQUEST).send('userId and orderId do not match');
                            }
                        });
                    } else {
                        res.status(HttpStatus.BAD_REQUEST).send('Token and userId do not match');
                    }
                });
            }else {
                res.status(HttpStatus.UNAUTHORIZED).send('Authentication Required');
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST).send('At least one input is empty');
        }
    } else {
        res.status(HttpStatus.BAD_REQUEST).send('At least one input is not defined')
    }


});

router.post('/orders/recipes/', (req,res) => {

    let post_data = req.body;
    let inputUserId = post_data.inputUserId;
    let inputOrderId = post_data.inputOrderId;
    let inputRecipeId = post_data.inputRecipeId;
    let inputNumberOfPortion = post_data.numberOfPortion;

    if (checkIfFieldsAreUndefined(inputUserId, inputOrderId, inputRecipeId, inputNumberOfPortion)) {
        if(checkIfFieldsAreEmpty(inputUserId, inputOrderId, inputRecipeId, inputNumberOfPortion)){
            if(req.headers[headerUserToken] !== undefined){
                getConnection.query(USER_QUERIES.checkIfTokenExistsAndCorrespondsToUser, [req.headers[headerUserToken], inputUserId], function (err, result, fields) {
                    getConnection.on('error', function (err) {
                        console.log('[MySQL Error] : ' +err);
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                    });
                    if (result && result.length > 0) {
                        getConnection.query(ORDER_QUERIES.select, [inputOrderId, inputUserId], (err, result, fields) => {
                            getConnection.on('error', function (err) {
                                console.log('[MySQL Error] : ' +err);
                                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                            });
                            if(result && result.length >0){
                                getConnection.query(ORDER_QUERIES.insertInOrderRecipeTable, [inputOrderId, inputRecipeId, inputNumberOfPortion], function (err, result, fields) {
                                    getConnection.on('error', function (err) {
                                        console.log('[MySQL Error] : ' +err);
                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                    });
                                    if(err){
                                        console.log('[MySQL Error]' +err);
                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Duplicate Entry');
                                    } else if (typeof result === typeof undefined){
                                        console.log('Rows : '+JSON.stringify(result));
                                        res.status(HttpStatus.OK).send('Order Inserted');
                                    } else {
                                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server Error');
                                    }
                                })
                            } else {
                                res.status(HttpStatus.BAD_REQUEST).send('userId and orderId do not match');
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


module.exports = router;
