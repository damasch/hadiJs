/**
 * Requirements
 */
var fs = require('fs');
var path = require('path');
var S = require('string');
var _ = require('lodash');
var async = require('async');

function readComponentDir(component, scope, scopeDir, callback)
{
    var tasks = [];

    // create new component object
    var componentN = {};
    componentN.name = component;
    componentN.directory = path.resolve(scopeDir, component);
    componentN.scope = scope;

    componentN.info = null;

    componentN.controller = null;

    componentN.view = null;

    componentN.models = [];

    componentN.style = {};
    componentN.style.scss = null;
    componentN.style.modifier = [];
    componentN.style.properties = [];

    // get markdown content
    if(fs.existsSync(componentN.directory + "/info.md"))
    {
        componentN.info = componentN.directory + "/info.md";
    }

    // get controller js
    if(fs.existsSync(componentN.directory + "/controller.js"))
    {
        componentN.controller = componentN.directory + "/controller.js";
    }

    // get view js
    if(fs.existsSync(componentN.directory + "/view.tpl"))
    {
        componentN.view = componentN.directory + "/view.tpl";
    }

    // get style scss
    if(fs.existsSync(componentN.directory + "/_style.scss"))
    {
        componentN.style.scss = componentN.directory + "/_style.scss";


        tasks.push(function (cb)
        {
            fs.readFile(componentN.style.scss, 'utf8', function (err,text) {

                //componentN.style.modifier = data;
                text = text.replace(/(?:\r\n|\r|\n)/g, '');
                var res = text.match(/(?:--)([a-z0-9]*)(?:())/g);
                var modifiers = [];
                if(res)
                {
                    for(var i = 0; i < res.length; i++)
                    {
                        var modifier = res[i].replace("--", "");
                        if(modifiers.indexOf(modifier) < 0)
                        {
                            modifiers.push(modifier);
                        }
                    }
                }
                componentN.style.modifier = modifiers;

                //componentN.style.modifier = data;
                var res = text.match(/(?:-)([a-z0-9]*)(?:())/g);
                var properties = [];
                if(res)
                {
                    for(var i = 0; i < res.length; i++)
                    {
                        var property = res[i].replace("-", "");
                        if(properties.indexOf(property) < 0)
                        {
                            properties.push(property);
                        }
                    }
                }
                componentN.style.properties = properties;
                cb();
            });
        });
    }

    componentN.dokumentation = "/" + scope + "/" + component + "/detail.html";

    componentN.modelsPath = componentN.directory + "/models";
    _.each(fs.readdirSync(path.resolve(componentN.directory, "models")), function(model)
    {
        tasks.push(function (cb)
        {
            componentN.models.push(model);
            cb();
        });
    });

    //callback after stack
    async.series(tasks, function(error)
    {
        callback(error, componentN);
    });
}


/**
 * Public api
 */
module.exports =  { readComponentDir : readComponentDir };
