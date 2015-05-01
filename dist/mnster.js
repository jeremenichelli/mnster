/*
 * mnster - v1.0.2
 * Simple and small data binding library
 * https://github.com/jeremenichelli/mnster
 * 2015 (c) Jeremias Menichelli - MIT License
*/

(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.mnster = factory(root);
    }
})(this, function(root) {
    'use strict';

    var _bindings = {},
        prefix = /^(mns-)/,
        suffix = /(\-[a-zA-Z0-9]+)+/;

    // PRIVATE METHODS

    /**
     * given a list of properties concatenated by dots and an object
     * returns the resulting data or an empty string
     * @method _getFromModel
     * @param {Object} model
     * @param {String} str
     */
    var _getFromModel = function(model, str) {
        var props = str.split('.'),
            prop = model;

        for (var i = 0, len = props.length; i < len; i++) {
            if (typeof prop[props[i]] !== 'undefined' && prop[props[i]] !== null) {
                prop = prop[props[i]];
            } else {
                return null;
            }
        }

        return prop;
    };

    /**
     * view constructor
     * @constructor View
     * @param {Object} config
     * @returns {Object}
     */
    var View = function(config) {
        var v = this;

        v.template = config.template;
        v.model = {};
        v.model[config.context] = config.model;
        v.controller = config.controller || root;

        v.bindModel();
    };

    /**
     * gets child nodes from template and binds each one if it's valid
     * @method view.bindModel
     */
    View.prototype.bindModel = function() {
        var v = this,
            nodesCount = 0;

        v.nodes = v.template.querySelectorAll('*');

        // check if template node has bindings
        v.bindNode(v.template);

        nodesCount = v.nodes.length;

        while (nodesCount) {
            v.bindNode(v.nodes[--nodesCount]);
        }

        nodesCount = null;
    };

    /**
     * goes through all attributes present in a node and apply bindings
     * @method view.bindNode
     * @param {Node} node
     */
    View.prototype.bindNode = function(node) {
        var v = this,
            attrs = node.attributes,
            attrsCount = attrs.length,
            // while block variables
            attr,
            name,
            type;

        while (attrsCount) {
            attr = attrs[--attrsCount];
            name = attr.name;
            type = name.replace(prefix, '').replace(suffix, '');

            // applied only if attr starts with `mns` and binding type is supported
            if (prefix.test(name) && _bindings[type]) {
                // wrap binding in a try to not halt rest of the binding process
                try {
                    _bindings[type]({
                        node: node,
                        attribute: attr.name,
                        value: attr.value,
                        valueFromModel: _getFromModel(v.model, attr.value),
                        controller: v.controller
                    });
                } catch (err) {
                    console.error(err);
                }
            }
        }

        attrs = attrsCount = attr = name = type = null;
    };

    /**
     * goes through all nodes and re-binds everything
     * @method view.update
     */
    View.prototype.update = function() {
        var v = this,
            nodesCount = 0;

        // check if template node has bindings
        v.bindNode(v.template);

        nodesCount = v.nodes.length;

        while (nodesCount) {
            v.bindNode(v.nodes[--nodesCount]);
        }

        nodesCount = null;
    };

    /**
     * goes through all attributes present in a node and apply bindings
     * @method _createView
     * @alias mnster.view
     * @param {Node} template
     * @param {Object} opt
     */
    var _createView = function(template, options) {
        // return if no template is passed
        if (!template || !template.nodeType || template.nodeType !== 1) {
            throw new Error('mnster.view: You must pass a valid template as a first argument');
        }

        // return if no context and model is passed
        if (!options || !options.context || !options.model) {
            throw new Error('mnster.view: You must specify a context and a model');
        }

        // create and return a new view
        var v = new View({
            template: template,
            context: options.context,
            model: options.model,
            controller: options.controller
        });

        return v;
    };

    /**
     * creates new binding
     * @method _setNewBinding
     * @param {name} String
     * @param {method} Function
     */
    var _createNewBinding = function(name, method) {
        if (typeof name !== 'string') {
            throw new Error('mnster.binding: name must be a string');
        }

        if (typeof method !== 'function') {
            throw new Error('mnster.binding: you must specify a method');
        }

        if (_bindings[name]) {
            throw new Error('mnster.binding: a binding with this name already exists');
        }

        _bindings[name] = method;
    };

    /**
     * erase existing binding
     * @method _deleteBinding
     * @param {name} String
     */
    var _deleteBinding = function(name) {
        if (typeof name !== 'string') {
            throw new Error('mnster.clean: name must be a string');
        }

        if (_bindings[name]) {
            _bindings[name] = null;
        }
    };

    // REGISTER BASIC BINDINGS
    _createNewBinding('text', function(context) {
        var node = context.node,
            content = context.valueFromModel;

        node.innerHTML = content !== null ? content + '' : '';
    });

    _createNewBinding('attr', function(context) {
        var node = context.node,
            attr = context.attribute.replace('mns-attr-', ''),
            value = context.valueFromModel;

        if (attr && value !== null) {
            node.setAttribute(attr, value + '');
        }
    });

    _createNewBinding('data', function(context) {
        var node = context.node,
            attr = context.attribute.replace('mns-', ''),
            value = context.valueFromModel;

        if (attr.replace('data-', '') && value !== null) {
            node.setAttribute(attr, value + '');
        }
    });

    _createNewBinding('show', function(context) {
        context.node.style.display = context.valueFromModel ? 'block' : 'none';
    });

    _createNewBinding('hide', function(context) {
        context.node.style.display = context.valueFromModel ? 'none' : 'block';
    });

    _createNewBinding('on', function(context) {
        var method = context.controller[context.value],
            ev = context.attribute.replace('mns-on-', '');

        function _addEvent (el, ev, fn) {
            if ('addEventListener' in document.body) {
                el.addEventListener(ev, fn, false);
            } else if ('attachEvent' in document.body) {
                el.attachEvent(ev, fn);
            } else {
                el['on' + ev] = fn;
            }
        }

        if (typeof method === 'function') {
            _addEvent(context.node, ev, method);
        }
    });

    _createNewBinding('each', function(context) {
        var node = context.node,
            data = context.valueFromModel,
            tempContext = context.attribute.replace('mns-each-', ''),
            tempData,
            tempView,
            tempNode;

        // creates buffer node
        if (!node.__mnsterEachTemplate__) {
            node.__mnsterEachTemplate__ = document.createElement('div');
            node.__mnsterEachTemplate__.innerHTML = node.innerHTML;
        }

        // clears content
        node.innerHTML = '';

        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                tempNode = document.createElement('div');
                tempNode.innerHTML = node.__mnsterEachTemplate__.innerHTML;

                // set temporary data
                tempData = data[i] || {};

                // set temporary view
                tempView = new View({
                    template: tempNode,
                    context: tempContext,
                    model: tempData
                });

                node.innerHTML += tempNode.innerHTML;
            }
        }

        tempData = tempNode = tempView = null;
    });

    return {
        view: _createView,
        binding: _createNewBinding,
        clean: _deleteBinding
    };
});