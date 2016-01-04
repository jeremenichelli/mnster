/*
 * mnster - v1.3.0
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
        prefixName = 'mns',
        prefix = /^(mns-)/,
        suffix = /(\-[a-zA-Z0-9]+)+/;

    /**
     * gets property given a dotted path or return null
     * @method _getFromModel
     * @param {Object} model
     * @param {String} str
     * @returns {null|*} prop
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
     * cleans node content (faster than innerHTML)
     * @method _empty
     * @param {Node} el
     * @returns {undefined}
     */
    var _empty = function(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }

        if (el.innerText) {
            el.innerText = '';
        }
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
     * @method View.bindModel
     * @returns {undefined}
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
     * @method View.bindNode
     * @param {Node} node
     * @returns {undefined}
     */
    View.prototype.bindNode = function(node) {
        var v = this,
            attrs = node.attributes,
            attrsCount = attrs && attrs.length ? attrs.length : 0,
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
                    console.log('mnster binding error: ' + err);
                }
            }
        }

        attrs = attrsCount = attr = name = type = null;
    };

    /**
     * goes through all nodes and re-binds everything
     * @method View.update
     * @returns {undefined}
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
     * @param {Object} options
     * @returns {Object} view
     */
    var _createView = function(template, options) {
        // return if no template is passed
        if (!template || !template.nodeType) {
            throw new Error('mnster.view: You must pass a valid template as a first argument');
        }

        // return if no context and model is passed
        if (!options || !options.context || !options.model) {
            throw new Error('mnster.view: You must specify a context and a model');
        }

        // create and return a new view
        var view = new View({
            template: template,
            context: options.context,
            model: options.model,
            controller: options.controller
        });

        return view;
    };

    /**
     * creates new binding
     * @method _setNewBinding
     * @param {String} name
     * @param {Function} method
     * @returns {undefined}
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
     * @param {String} name
     * @returns {undefined}
     */
    var _deleteBinding = function(name) {
        if (typeof name !== 'string') {
            throw new Error('mnster.clean: name must be a string');
        }

        if (_bindings[name]) {
            _bindings[name] = null;
        }
    };

    /**
     * change binding prefix
     * @method _setPrefix
     * @param {String} prfx
     * @returns {undefined}
     */
    var _setPrefix = function(prfx) {
        if (typeof prfx !== 'string' || prfx === '') {
            throw new Error('mnster.prefix: prefix must be a populated string');
        }

        prefixName = prfx;
        prefix = new RegExp('^(' + prfx + ')-');
    };

    // REGISTER BASIC BINDINGS
    _createNewBinding('text', function(context) {
        var node = context.node,
            content = context.valueFromModel,
            prop = node.innerText ? 'innerText' : 'textContent';

        node[prop] = content !== null ? content + '' : '';
    });

    _createNewBinding('html', function(context) {
        var node = context.node,
            content = context.valueFromModel;

        node.innerHTML = content !== null ? content + '' : '';
    });

    _createNewBinding('attr', function(context) {
        var node = context.node,
            attr = context.attribute.replace(prefixName + '-attr-', ''),
            value = context.valueFromModel;

        if (attr && value !== null) {
            node.setAttribute(attr, value + '');
        }
    });

    _createNewBinding('data', function(context) {
        var node = context.node,
            attr = context.attribute.replace(prefixName + '-', ''),
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
            ev = context.attribute.replace(prefixName + '-on-', '');

        if (typeof method === 'function') {
            context.node.addEventListener(ev, method, false);
        }
    });

    _createNewBinding('each', function(context) {
        var node = context.node,
            data = context.valueFromModel,
            tempContext = context.attribute.replace(prefixName + '-each-', ''),
            tempView, // eslint-disable-line no-unused-vars
            tempData,
            tempNode;

        // creates buffer node
        if (!node.__mnsterEachTemplate__) {
            node.__mnsterEachTemplate__ = document.createElement('div');
            node.__mnsterEachTemplate__.innerHTML = node.innerHTML;
        }

        // clears content
        _empty(node);

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

        tempView = tempData = tempNode = null;
    });

    return {
        view: _createView,
        binding: _createNewBinding,
        clean: _deleteBinding,
        prefix: _setPrefix
    };
});
