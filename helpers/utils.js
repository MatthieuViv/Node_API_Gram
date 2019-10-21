const mysql = require('mysql');
const emailValidator = require("email-validator");
const passwordValidator = require('password-validator');
const libPhoneNumber = require('libphonenumber-js');

export function getConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'gram'
    });
}

export function checkIfFieldsAreEmpty(... allFields){
    console.log('checkUserInput : ' +allFields);
    for (field  of allFields) {
        if (field.toString().trim().length === 0){
            return false
        }
    }
    return true;
}

export function checkIfFieldsAreUndefined(... allFields){
    console.log('checkUserInput : ' +allFields);
    for (field  of allFields) {
        if (typeof field === typeof undefined){
            return false
        }
    }
    return true;
}

export function checkHashPassword(user_password, salt) {
    let passwordData = sha512(user_password, salt);
    return passwordData;
}

export function convertToInternationalFormat(phoneNumber){
    let asYouType = new libPhoneNumber.AsYouType('FR').input(phoneNumber);
    let phoneNumberFromString = libPhoneNumber.parsePhoneNumberFromString(asYouType, 'FR');
    let internationalFormat = phoneNumberFromString.formatInternational();
    return internationalFormat.replace(/\s+/g, '');
}

export function checkEmailValidity(email){
    return emailValidator.validate(email);
}

export function checkPassword(password){
    let schema = new passwordValidator();
    schema
        .is().min(6)                                    // Minimum length 86
        .is().max(70)                                   // Maximum length 70
        .has().uppercase()                              // Must have uppercase letters
        .has().lowercase()                              // Must have lowercase letters
        .has().digits()                                 // Must have digits
        .has().not().spaces()                           // Should not have spaces

    return schema.validate(password);
}
