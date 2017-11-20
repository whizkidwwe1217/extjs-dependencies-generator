# ExtJS Dependencies Generator
Generates an array of ExtJS dependencies in the right order. This library also checks if there's a cyclic dependency.

## Installation
1. Install ExtJS Dependencies Generator through npm:
    ```
    npm install extjs-dependencies-generator
    ```
## Usage
1. In your JavaScript program, declare the extjs-dependencies-generator library as a variable to gain access to it's generator function:
    ```javascript
    var gen = require('extjs-dependencies-generator');
    ```
2. Call the **generateDependencies** function to generate ExtJS dependency list.
    ```javascript
    gen.generateDependencies(dir, d => {
        let files = d.files;
        // Do something with the files array here...    
    })
    ```
    ### generateDependencies (sourceDir: string, callback: function)
    `sourceDir` - The directory that contains all the ExtJS files.

    `callback` - This is called after all the dependencies are determined. Returns a dependencies object that contains all the files sorted in the right order based on the dependency graph. Returns the object with the following properties:
        
        1. graph - the dependency graph.
        2. dependencies - returns { classname, filename }
        3. files - returns the object in the following format { pattern: filename }

## Complete Example
This example shows you how to generate a list of dependencies in the right order and saves it to a file.
```javascript
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
```