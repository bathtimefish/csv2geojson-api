'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 http://www.w3schools.com/js/js_strict.asp
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var request = require('request');
var csv2geojson = require('csv2geojson');
var githubApi = require('github');
var base64 = require('js-base64').Base64;
var co = require('co');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  convert: convert,
  githubPush: github_push
};



/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function convert(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name};
    var url = req.swagger.params.url.value;
    var latField = req.swagger.params.latfield.value;
    var lngField = req.swagger.params.lngfield.value;
    // CSVを受信してgeojsonに変換する
    var option = {
        url: url,
        latField: latField,
        lngField: lngField
    };
    _convetGeoJson(option).then(function(data) {
        res.json(data);
    }).catch(function(err) {
        res.json(err);
    });
}

function github_push(req, res) {
    co(function* () {

        'use strict';
        var repo = req.swagger.params.repo.value;
        var branch = req.swagger.params.branch.value || 'master';
        var url = req.swagger.params.url.value;
        var latField = req.swagger.params.latfield.value;
        var lngField = req.swagger.params.lngfield.value;
        var name = req.swagger.params.name.value;

        // CSVを受信してgeojsonに変換する
        var csvOptions = {
            url: url,
            latField: latField,
            lngField: lngField
        };
        var geoJson = yield _convetGeoJson(csvOptions);

        // リポジトリに同名ファイルがあるか調べる
        var options = {
            user: process.env.GITHUB_USERNAME,
            repo: repo,
            branch: branch,
            name: name
        };
        var exists = yield _isContentExists(options);

        var result = {};
        if(!exists) {
            // GitHubにファイルを作成する
            var options = {
                user: process.env.GITHUB_USERNAME,
                repo: repo,
                path: name,
                message: "add " + name,
                branch: branch,
                content: base64.encode(JSON.stringify(geoJson)),
            };
            result = yield _createFile(options);
        } else {
            var options = {
                user: process.env.GITHUB_USERNAME,
                repo: repo,
                path: name,
                message: "update " + name,
                branch: branch,
                content: base64.encode(JSON.stringify(geoJson)),
                sha: exists.sha
            }
            result = yield _updateFile(options);
        }

        res.json(result);

    }.bind(this)).catch(function(err) {
        console.log('!!! Catch Errors in co');
        console.log(err);
        res.json({'success': false, 'error': 'Internal server error'});
    }.bind(this));
}

/**
 * CSVを受信してgeojsonに変換する
 */
function _convetGeoJson(options) {
    return new Promise(function(resolve, reject) {
        var url = options.url
        var latField = options.latField
        var lngField = options.lngField
        request(url, function(error, response, body) {
            if(error) reject(error);
            var csvString = body;
            var options = {
                latfield: latField,
                lonfield: lngField,
                delimiter: ','
            };
            csv2geojson.csv2geojson(csvString, options, function(err, data) {
                if(!err){
                    resolve(data);
                } else {
                    reject(err);
                }
            });
        });
    });
}

/**
 * GitHub リポジトリに対象nameのファイルがあるか調べる
 */
function _isContentExists(options) {
    return new Promise(function(resolve, reject) {
        var github = new githubApi({"version":"3.0.0"});
        github.authenticate({
            type: "basic",
            username: process.env.GITHUB_USERNAME,
            password: process.env.GITHUB_PASSWORD
        });
        github.repos.getBranch(options, function(err, res) {
            if(err) {
                reject(err);
                return false;
            }
            var treeOptions = {
                user: process.env.GITHUB_USERNAME,
                repo: options.repo,
                branch: options.branch,
                name: options.name,
                sha: res.commit.sha
            }
            github.gitdata.getTree(treeOptions, function(err, res) {
                if(err) {
                    reject(err);
                    return false;
                }
                var exists = false;
                for(var i=0; i<res.tree.length; i++) {
                    var regx = new RegExp(treeOptions.name, "i");
                    if(regx.test(res.tree[i].path)) {
                        exists = res.tree[i];
                        break;
                    }
                }
                resolve(exists);
            });
        });
    });
}

/**
 * リポジトリにgeojsonファイルを作成する
 */
function _createFile(options) {
    return new Promise(function(resolve, reject) {
        var github = new githubApi({"version":"3.0.0"});
        github.authenticate({
            type: "basic",
            username: process.env.GITHUB_USERNAME,
            password: process.env.GITHUB_PASSWORD
        });
        github.repos.createFile(options, function(err, res) {
            if(err) {
                reject(err);
                return false;
            }
            resolve(res);
        });
    });
}

/**
 * リポジトリの対象ファイルを更新する
 */
function _updateFile(options) {
    return new Promise(function(resolve, reject) {
        var github = new githubApi({"version":"3.0.0"});
        github.authenticate({
            type: "basic",
            username: process.env.GITHUB_USERNAME,
            password: process.env.GITHUB_PASSWORD
        });
        github.repos.updateFile(options, function(err, res) {
            if(err) {
                reject(err);
                return false;
            }
            resolve(res);
        });
    });
}
