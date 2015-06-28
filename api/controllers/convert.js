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
  convert: convert
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
    request(url, function(error, response, body) {
        var csvString = body;
        var options = {
            latfield: latField,
            lonfield: lngField,
            delimiter: ','
        };
        csv2geojson.csv2geojson(csvString, options, function(err, data) {
            res.header('Access-Control-Allow-Origin', '*');
            res.json(data);
        });
    });
}
