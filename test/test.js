var beautify = require('js-beautify').js_beautify;
var fs = require('fs');
var gen = require('../index');
var _ = require('underscore');
var dir = 'test/src/**/*.js';

gen.generateDependencies(dir, d => {
    let files = [];
    _.each(d.dependencies, f => {
        files.push({ pattern: f.filename, watched: true });
    });
    writeFile("dependencies.js", beautify(JSON.stringify(files)));
});


function writeFile(filename, content) {
    fs.writeFile(filename, content, 'utf-8', function (err) {
        if (err)
            console.log(err);
    });
}