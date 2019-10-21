const formidable = require("formidable"),
	uuid = require("uuid/v1"),
	fs = require("fs"),
	rimraf = require("rimraf");

exports.upload = function (req, folder, callback) {
	if (!fs.existsSync("./public/images")) {
		fs.mkdirSync("./public/images");
	}

	if (!fs.existsSync("./public/images/" + folder)) {
		fs.mkdirSync("./public/images/" + folder);
	}
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		if (err) { console.log(err); return callback(err); }
		var oldpath = files.filetoupload.path;
		var imageID = uuid();
		var newpath = "./public/images/" + folder + "/" + imageID + ".png";
		fs.rename(oldpath, newpath, function (err, res) {
			if (err) { console.log(err); return callback(err); }
			fields.imageID = imageID;
			callback(null, fields);
		});
	});
};

exports.uploadCarousel = function (req, callback) {
	if (!fs.existsSync("./public/images/recipes_carousel")) {
		fs.mkdirSync("./public/images/recipes_carousel");
	}

	var form = new formidable.IncomingForm();
	form.multiples = true;

	var fields = {};

	form.on('field', function (name, value) {
		if (!fields[name]) {
			fields[name] = value;
		} else {
			if (fields[name].constructor.toString().indexOf("Array") > -1) { // is array
				fields[name].push(value);
			} else { // not array
				var tmp = fields[name];
				fields[name] = [];
				fields[name].push(tmp);
				fields[name].push(value);
			}
		}
	});

	form.parse(req, function (err, f, files) {
		if (err) { console.error(err); return callback(err); }

		let folderName = fields.name;
		if (!fs.existsSync("./public/images/recipes_carousel/" + folderName)) {
			fs.mkdirSync("./public/images/recipes_carousel/" + folderName);
		}

		fields.imageIDs = [];

		if (!Array.isArray(files.filetoupload)) {
			files.filetoupload = [files.filetoupload];
		}

		files.filetoupload.forEach((e, i) => {
			let oldpath = e.path;
			let imageID = uuid();
			let newpath = "./public/images/recipes_carousel/" + folderName + "/" + imageID + ".png";
			fs.rename(oldpath, newpath, function (err, res) {
				if (err) { console.log(err); return callback(err); }
				fields.imageIDs.push(folderName + "/" + imageID + ".png");
				if (i === files.filetoupload.length - 1) {
					callback(null, fields);
				}
			});
		});
	});
};

exports.remove = function (path, callback) {
	fs.unlink("./public/images/" + path, function (err) {
		if (err) { console.log(err); return callback(err); }
		callback(null, true);
	});
};

exports.removeFolder = function (path) {
	path = "./public/images/" + path;
	if (fs.existsSync(path)) {
		console.log("start remove")
		fs.readdirSync(path).forEach(function (file, index) {
			var curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				removeFolder(curPath);
			} else { // delete file
				fs.unlinkSync(curPath, function (err) {
					console.error(err);
				});
			}
		});
		fs.rmdirSync(path);
	}
};