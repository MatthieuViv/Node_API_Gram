router.post('/users/login', (req, res, next)=> {

    console.log('users/login: ')
    const  connection = getConnection();

    let post_data = req.body;
    let user_password = post_data.password;
    let user_email = post_data.email;
    console.log(user_email);

    if (checkValidityOfUserDetails(user_email)) {
        connection.query(querySelectUser, [user_email] , function(err, result, fields) {
            connection.on('error', function (err) {
                console.log('[MySQL ERROR]', err);
            });
            // console.log(result);
            if (result && result.length ){
                let salt = result[0].salt;
                let encrypted_password = result[0].mot_de_passe;
                let hashed_password = checkhashPassword(user_password, salt).passwordHash;
                let newToken = uuid.v4();
                if (encrypted_password == hashed_password) {
                    connection.query(queryUpdateUser, [newToken, user_email], function (err, result, fields) {
                        connection.on('error', function (err) {
                            console.log('[MySQL ERROR]', err);
                        });
                        if (result){
                            connection.query(querySelectTokenFromUser, [user_email], function (err, result, fields) {
                                connection.on('error', function (err) {
                                    console.log('[MySQL ERROR]', err);
                                });
                                res.end(JSON.stringify(result[0])); //Send the token back to the user
                            });
                        }
                        console.log('User last_connection updated');
                        // res.end(JSON.stringify(result[0])) //If password is true, return all info of user
                    });
                } else
                    res.end(JSON.stringify('Wrong password'))
            }
            else {
                console.log('User does not exist');
                res.json('User does not exist');
            }
        });
    } else {
        res.end("The input fields are not valid");
    }

});