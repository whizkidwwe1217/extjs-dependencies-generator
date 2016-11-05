var esprima = require('esprima');
var _ = require('underscore');
var Path = require('path');
var fs = require('fs');
var glob = require('glob');
var DepGraph = require('dependency-graph').DepGraph;
var Vinyl = require('vinyl');

function loadClasses(dir, callback) {
    glob(dir, function (err, files) {
        let graph = new DepGraph();
        _.each(files, f => {
            let className = getClassName(f);

            if (!graph.hasNode(className))
                graph.addNode(className, f);
        });
        resolveDependencies(dir, graph, callback);
    });
}

function resolveDependencies(dir, graph, callback) {
    glob(dir, function (err, files) {
        _.each(files, f => {
            let o = getParsedObject(f);
            let d = o.dependencies;
            if (d.length > 0) {
                _.each(d, c => {
                    if (graph.hasNode(c)) {
                        graph.addDependency(o.className, c);
                    }
                });
            }
        });
        let dependencies = graph.overallOrder(false);
        let mapped = _.map(dependencies, d => {
            return { className: d, filename: graph.getNodeData(d) };
        });
        if (callback) {
            callback({ graph: graph, dependencies: mapped, files: _.map(mapped, f => { return { pattern: f.filename }; }) });
        }
    });
}

function generateDependencies(dir, callback) {
    loadClasses(dir, callback);
}

function getClassName(filename) {
    let data = fs.readFileSync(filename, 'utf-8');
    let tree = esprima.parse(data);
    return parseTreeAndGetClassName(tree);
}

function getParsedObject(filename) {
    let data = fs.readFileSync(filename, 'utf-8');
    let tree = esprima.parse(data);
    return parseTree(tree);
}

function parseTreeAndGetClassName(tree) {
    let className;
    let args;
    if (tree.body[0] && tree.body[0].expression)
        args = tree.body[0].expression.arguments;

    if (args) {
        let literal = _.findWhere(args, { type: 'Literal' });
        let objectExp = _.findWhere(args, { type: 'ObjectExpression' });
        let properties = objectExp.properties;
        className = literal.value;
    }
    return className;
}

function parseTree(tree) {
    let className;
    let args;
    let dependencies = [];
    if (tree.body[0] && tree.body[0].expression)
        args = tree.body[0].expression.arguments;

    if (args) {
        let literal = _.findWhere(args, { type: 'Literal' });
        let objectExp = _.findWhere(args, { type: 'ObjectExpression' });
        let properties = objectExp.properties;
        className = literal.value;
        _.each(properties, prop => {
            if (prop.type === "Property" && prop.key.type === "Identifier") {
                switch (prop.key.name) {
                    case "extend":
                        var s = prop.value.value.split(".", 1);
                        var name = "";
                        if (s.length > 0) {
                            name = s;
                        }
                        if (name != "Ext") {
                            dependencies.push(prop.value.value);
                        }
                        break;
                    case "requires":
                        if (prop.value) {
                            _.each(prop.value.elements, function (e) {
                                if (e) {
                                    var s = e.value.split(".", 1);
                                    var name = "";
                                    if (s.length > 0) {
                                        name = s;
                                    }
                                    if (name != "Ext")
                                        dependencies.push(e.value);
                                }
                            });
                        }
                        break;
                }
            }
        });
    }
    return {
        className: className,
        dependencies: dependencies
    };
}

function writeFile(filename, content) {
    fs.writeFile(filename, content, 'utf-8', function (err) {
        if (err)
            console.log(err);
    });
}

exports.generateDependencies = generateDependencies;