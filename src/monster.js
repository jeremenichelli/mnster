(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(root);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.monster = factory(root);
    }
})(this, function () {
    'use strict';
    var prefix = /^(mns-)/,
        prefixAttr = /^(mns-attr-)/,
        prefixEach = /^(mns-each-)/,
        suffix = /(-)([a-zA-Z])*/;

    var view = function (options) {
        var v = this;

        if (!options.template) {
            console.log('You must specify a template for this view');
            return;
        } else {
            v.template = options.template;
        };

        if (!options.model) {
            console.log('You must specify a model for this view');
            return;
        } else {
            if (options.context === '') {
                v.model = options.model;
            } else {
                v.context = options.context;
                v.model = {};
                v.model[options.context] = options.model;
            }
        };

        v.bindModel();
    };

    var _toProperty = function (obj, str) {
        var props = str.split('.'),
            prop = obj;

        for (var i = 0, len = props.length; i < len; i++) {
            if (prop[props[i]]) {
                prop = prop[props[i]];
            } else {
                prop = false;
            }
        };

        return prop;
    }

    var _bindings = {
        text: function (node, attr, model) {
            var data = _toProperty(model, attr.value);
            node.innerHTML = (data) ? data : '';
        },
        attr: function (node, attr, model) {
            var attribute = attr.name.replace(prefixAttr, ''),
                value = _toProperty(model, attr.value);

            node.setAttribute(attribute, value ? value : '');
        },
        each: function (node, attr, model, context) {
            var data = _toProperty(model, context + '.' + attr.name.replace(prefixEach, '')),
                bufferNode;

            if (!node.monsterTmp) {
                node.monsterTmp = node.children[0].cloneNode(true);
            }
            bufferNode = node.monsterTmp.cloneNode(true);
            node.innerHTML = '';


            for (var i = 0, len = data.length; i < len; i++) {
                var tempData = {},
                    tempNode = bufferNode.cloneNode(true),
                    tempView;

                // set temporary data
                tempData = data[i]

                // set temporary view
                tempView = new view({
                    template: tempNode,
                    context: attr.value,
                    model: tempData 
                });

                node.appendChild(tempNode);
            };

            tempData = tempNode = tempView = null;
        }
    };

    view.prototype.bindModel = function () {
        var v = this;

        v.nodes = v.template.querySelectorAll('*');

        for (var i = 0, len = v.nodes.length; i < len; i++) {
            var node = v.nodes[i];

            v.bindNode(node);
        };
    };

    view.prototype.bindNode = function (node) {
        var v = this,
            attrs = node.attributes;

        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i],
                name = attr.name,
                type;

            if (prefix.test(name)) {
                type = name.replace(prefix, '').replace(suffix, '');
                _bindings[type](node, attr, v.model, v.context);
            }
        }
    };

    var _createView = function (template, opt) {
        // create and return a new view
        var v = new view({
            template: template,
            context: opt.context,
            model: opt.model
        });

        return v;
    };

    return {
        view: _createView
    };
});