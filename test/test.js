var beautify = require('js-beautify').js_beautify;
var fs = require('fs');
var gen = require('../index');

var dir = 'src/**/*.js';

gen.generateDependencies(dir, d => {
    writeFile("dependencies.js", beautify(JSON.stringify(d.files)));
});


function writeFile(filename, content) {
    fs.writeFile(filename, content, 'utf-8', function (err) {
        if (err)
            console.log(err);
    });
}