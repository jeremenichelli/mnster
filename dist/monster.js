// monster - Jeremias Menichelli
// https://github.com/jeremenichelli/monster - MIT License

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.monster = factory(root);
    }
})(this, function (root) {
    'use strict';

    var _bindings = {},
        prefix = /^(mns-)/,
        suffix = /(\-[a-zA-Z0-9]+)+/;

    // LEGACY METHODS

    /**
     * method to check if node is an HTML Element (private)
     * @method _isValidNode
     * @param {node} node
     * @returns {Boolean}
     */
    var _isValidNode = function (node) {
        return node.nodeType === 1;
    };

    /**
     * receives an object and a string with property names concatenated by dots and gets the resulting data
     * @method _toProperty
     * @param {obj} model
     * @param {str} String
     */
    var _toProperty = function (obj, str) {
        var props = str.split('.'),
            prop = obj;

        for (var i = 0, len = props.length; i < len; i++) {
            if (typeof prop[props[i]] !== 'undefined' && prop[props[i]] !== null) {
                prop = prop[props[i]];
            } else {
                return '';
            }
        }

        return prop;
    };

    /**
     * cross-browser method to add a class to an element (private)
     * @method _addClass
     * @param {el} node
     * @param {cl} String
     */
    var _addClass = (function () {
        if ('classList' in document.body) {
            return function(el, cl) {
                el.classList.add(cl);
            };
        } else {
            return function(el, cl) {
                el.className += (el.className === '') ? cl : ' ' + cl; 
            };
        }
    })();

    /**
     * cross-browser method to bind an event (private)
     * @method _addEvent
     * @param {el} node
     * @param {ev} String
     * @param {fn} Function
     */
    var _addEvent = (function () {
        if ('addEventListner' in document.body) {
            return function (el, ev, fn) {
                el.addEventListener(ev, fn, false);
            };
        } else if ('attachEvent' in document.body) {
            return function (el, ev, fn) {
                el.attachEvent(ev, fn); 
            };
        } else {
            return function (el, ev, fn) {
                el['on' + ev] = fn;
            };
        }
    })();

    /**
     * view constructor
     * @method View
     * @param {config} object
     * @returns {object}
     */
    var View = function (config) {
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
    View.prototype.bindModel = function () {
        var v = this,
            nodesCount = 0,
            tempNode;

        v.nodes = v.template.childNodes;

        // check if template node has bindings
        v.bindNode(v.template);

        nodesCount = v.nodes.length;

        while (nodesCount) {
            tempNode = v.nodes[--nodesCount];

            if (_isValidNode(tempNode)) {
                v.bindNode(tempNode);
            }
        }

        tempNode = nodesCount = null;
    };

    /**
     * goes through all attributes present in a node and apply bindings
     * @method view.bindNode
     * @param {node} node
     */
    View.prototype.bindNode = function (node) {
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
            if (prefix.test(name) && type in _bindings) {
                // wrap binding in a try to not halt rest of the binding process
                try {
                    _bindings[type]({
                        node: node,
                        attribute: attr.name,
                        value: attr.value,
                        valueFromModel: _toProperty(v.model, attr.value),
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
    View.prototype.update = function () {
        var v = this,
            nodesCount = 0,
            tempNode;

        // check if template node has bindings
        v.bindNode(v.template);

        nodesCount = v.nodes.length;

        while (nodesCount) {
            tempNode = v.nodes[--nodesCount];

            if (_isValidNode(tempNode)) {
                v.bindNode(tempNode);
            }
        }

        tempNode = nodesCount = null;
    };

    // BINDINGS
    _bindings.text = function (options) {
        var node = options.node;

        node.innerHTML = options.valueFromModel + '';
    };

    _bindings.attr = function (options) {
        var node = options.node,
            attribute = options.attribute.replace('mns-attr-', '');

        node.setAttribute(attribute, options.valueFromModel + '');
    };

    _bindings.data = function (options) {
        var node = options.node,
            attribute = options.attribute.replace('mns-', '');

        node.setAttribute(attribute, options.valueFromModel + '');
    };

    _bindings.each = function (options) {
        var node = options.node,
            data = options.valueFromModel,
            tempContext = options.attribute.replace('mns-each-', ''),
            tempData,
            tempView,
            tempNode,
            bufferNode;

        if (!node.__monsterTemplate__) {
            node.__monsterTemplate__ = node.children[0].cloneNode(true);
        }
        bufferNode = node.__monsterTemplate__.cloneNode(true);
        node.innerHTML = '';

        for (var i in data) {
            tempNode = bufferNode.cloneNode(true);

            // set temporary data
            tempData = data[i] || {};

            // set temporary view
            tempView = new View({
                template: tempNode,
                context: tempContext,
                model: tempData
            });

            node.appendChild(tempNode);
        }

        tempData = tempNode = tempView = bufferNode = null;
    };

    _bindings.show = function (options) {
        var node = options.node;

        node.style.display = !!options.valueFromModel ? 'block' : 'none'; 
    };

    _bindings.hide = function (options) {
        var node = options.node;

        node.style.display = !!options.valueFromModel ? 'none' : 'block'; 
    };

    _bindings['class'] = function (options) {
        var node = options.node;

        if (options.valueFromModel !== '') {
            _addClass(node, options.valueFromModel + '');
        }
    };

    _bindings.on = function (options) {
        var node = options.node,
            ev = options.attribute.replace('mns-on-', ''),
            method = options.controller[options.value];

        if (typeof method === 'function') {
            _addEvent(node, ev, method);
        }        
    };

    /**
     * goes through all attributes present in a node and apply bindings
     * @method _createView
     * @param {node} node
     */
    var _createView = function (template, opt) {
        // return if no template is passed
        if (!template || !_isValidNode(template)) {
            console.error('monster.view: You must pass a valid template as a first argument');
            return;
        }

        // return if no context and model is passed
        if(!opt.context || !opt.model) {
            console.error('monster.view: You must specify a context and a model');
            return;
        }

        // create and return a new view
        var v = new View({
            template: template,
            context: opt.context,
            model: opt.model,
            controller: opt.controller
        });

        return v;
    };

    return {
        view: _createView
    };
});