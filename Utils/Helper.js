const mysql = require('mysql');

export function getConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'gram'
    });
}
