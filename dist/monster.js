// monster - Jeremias Menichelli
// https://github.com/jeremenichelli/monster - MIT License

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
})(this, function (root) {
    'use strict';

    var _bindings = {},
        prefix = /^(mns-)/,
        prefixAttr = /^(mns-attr-)/,
        prefixEach = /^(mns-each-)/,
        prefixOn = /^(mns-on)/,
        suffix = /((-)[a-zA-Z0-9]+)+/;

    // constructor
    var View = function (options) {
        var v = this;

        if (!options.template) {
            console.error('No template specified');
            return;
        } else {
            v.template = options.template;
        }

        if (!options.model || !options.context) {
            console.error('Please specify a model and a context');
            return;
        } else {
            v.model = {};
            v.model[options.context] = options.model;
            v.controller = options.controller || root;
        }

        v.bindModel();
    };


    // adding a class for mns-class binding
    var _addClass = function (el, cl) {
        if ('classList' in el) {
            el.classList.add(cl);
        } else {
            el.className += (el.className === '') ? cl : ' ' + cl; 
        }
    };

    // get property from an object and a string
    var _toProperty = function (obj, str) {
        var props = str.split('.'),
            prop = obj;

        for (var i = 0, len = props.length; i < len; i++) {
            if (typeof prop[props[i]] !== 'undefined' && prop[props[i]] !== null) {
                prop = prop[props[i]];
            } else {
                prop = '';
            }
        }

        return prop;
    };

    // available bindings
    _bindings.text = function (node, attr, model) {
        var data = _toProperty(model, attr.value);
        node.innerHTML = data + '';
    };
    _bindings.attr = function (node, attr, model) {
        var attribute = attr.name.replace(prefixAttr, ''),
            value = _toProperty(model, attr.value);

        node.setAttribute(attribute, value + '');
    };

    _bindings.data = function (node, attr, model) {
        var attribute = attr.name.replace(prefix, ''),
            value = _toProperty(model, attr.value);

        node.setAttribute(attribute, value + '');
    };

    _bindings.each = function (node, attr, model) {
        var data = _toProperty(model, attr.value),
            tempContext = attr.name.replace(prefixEach, ''),
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

    _bindings.show = function (node, attr, model) {
        var dataShow = _toProperty(model, attr.value);

        node.style.display = (!!dataShow) ? 'block' : 'none'; 
    };

    _bindings.hide = function (node, attr, model) {
        var dataHide = _toProperty(model, attr.value);

        node.style.display = (!!dataHide) ? 'none' : 'block'; 
    };

    _bindings['class'] = function (node, attr, model) {
        if (attr.value) {
            var cl = _toProperty(model, attr.value);
            _addClass(node, cl + '');
        }
    };

    _bindings.on = function (node, attr, model, controller) {
        var ev = attr.name.replace(prefix, ''),
            method = controller[attr.value];

        if (typeof method === 'function') {
            node[ev] = method.bind(node);
        }        
    };

    // view prototype methods
    View.prototype.bindModel = function () {
        var v = this;

        v.nodes = v.template.querySelectorAll('*');

        v.bindNode(v.template);

        for (var i = 0, len = v.nodes.length; i < len; i++) {
            v.bindNode(v.nodes[i]);
        }
    };

    View.prototype.bindNode = function (node) {
        var v = this,
            attrs = node.attributes;

        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i],
                name = attr.name, 
                type = name.replace(prefix, '').replace(suffix, '');

            // applied only if attr starts with mns and binding type is supported
            if (prefix.test(name) && type in _bindings) {
               _bindings[type](node, attr, v.model);
            } else if (prefixOn.test(name)) {
                _bindings.on(node, attr, v.model, v.controller);
            }
        }
    };

    View.prototype.update = function () {
        var v = this;

        for (var i = 0, len = v.nodes.length; i < len; i++) {
            v.bindNode(v.nodes[i]);
        }
    };

    var _createView = function (template, opt) {
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