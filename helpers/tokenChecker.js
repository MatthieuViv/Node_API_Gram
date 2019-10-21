module.exports = function (connection) {
	return function (req, res, next) {
		var token = req.headers["x-access-token"];
		var id = req.headers["x-access-id"];
		const queryCheckIfTokenExistsAndCorrespondsToUser = 'SELECT email_address from user where connection_token = ? AND id=?';
		connection.query(queryCheckIfTokenExistsAndCorrespondsToUser, [token, id], function (err, result, fields) {
			if (err) {console.error(err); return res.status(401).send("Unauthorized access");}
			console.log(result)
			if (!(result && result.length > 0)) return res.status(401).send("Unauthorized access");
			res.locals.userInfo = { token: token, id: id, email: result[0].email_address };
			next();
		});
	}
};