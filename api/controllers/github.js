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
  github: github,
  githubPush: github_push
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function github(req, res) {

    var github = new githubApi({"version":"3.0.0"});
    github.authenticate({
        type: "basic",
        username: process.env.GITHUB_USERNAME,
        password: process.env.GITHUB_PASSWORD
    });
    /*
    github.authorization.create({
        scopes: ["user", "public_repo", "repo", "repo:status", "gist"],
        note: "a test4"
    }, function(err, e) {
        //console.error(err);
        //console.log(e);
    });
    */
    /*
    github.user.get({}, function(err, data) {
        console.log(err);
        console.log(data);
    });
    */
    var options = {
        user: "bathtimefish",
        repo: "test-app",
    };
    github.repos.getBranches(options, function(err, e) {
        console.error(err);
        console.log(e[0].commit.sha);
        var options = {
            user: "bathtimefish",
            repo: "test-app",
            sha: e[0].commit.sha
        }
        github.gitdata.getTree(options, function(err, e) {
            console.error(err);
            console.log(e);
        });
    });
    /*
    var options = {
        user: "bathtimefish",
        repo: "test-app",
        path: "hello.txt",
        message: "add hoge.md",
        content: "bXkgbmV3IGZpbGUgY29udGVudHM=",
    };
    github.repos.createFile(options, function(err, e) {
        console.error(err);
        console.log(e);
    });
    */

    res.json({"hoge":"fuga"});
}

function github_push(req, res) {
    var username = req.swagger.params.username.value;
    var usertype = req.swagger.params.usertype.value;
    var data = {
        "username": username,
        "usertype": usertype
    };
    res.json(data);
}
