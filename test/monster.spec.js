describe('monster', function () {

    describe('Global access', function () {
        it('monster namespace available', function () {
            expect(typeof window.monster).toBe('object');
        });
        it('monster.view method available', function () {
            expect(typeof window.monster.view).toBe('function');
        });
        it('monster.binding method available', function () {
            expect(typeof window.monster.binding).toBe('function');
        });
        it('monster.clean method available', function () {
            expect(typeof window.monster.clean).toBe('function');
        });
    });

    describe('monster.view', function () {
        describe('check primary functionality', function () {
            var template, model, _window;
            beforeEach(function () {
                template = document.createElement('div');
                // add text node
                template.innerHTML = 'hi! I\'m a text node' +
                    // add element node
                    '<span mns-sample="obj.one"></span>' +
                    // add comment node
                    '<!-- <span mns-sample="obj.two"></span> -->' +
                    // add another element node
                    '<span mns-sample="obj.three.four.five"></span>' +
                    // add another element node
                    '<span mns-sample="obj.1.2.3"></span>';

                model = {
                    one: 'text_one',
                    two: 'text_two',
                    three: {
                        four: {
                            five: null
                        }
                    },
                    1: {
                        2: {
                            3: 'text_3'
                        }
                    }
                };

                // create sample binding
                _window = {
                    sampleBinding: function (context) {
                        var opt = context;
                        return opt;
                    }
                };

                // spy on binding
                spyOn(_window, 'sampleBinding');

                // sets new binding
                monster.binding('sample', _window.sampleBinding);
            });
            afterEach(function () {
                monster.clean('sample');
                template = model = _window = null;
            });
            it('binds only element nodes', function () {
                monster.view(template, {
                    context: 'obj',
                    model: model
                });

                expect(_window.sampleBinding.callCount).toBe(3);
            });
            it('accepts bindings at template level', function () {
                template.innerHTML = '';

                template.setAttribute('mns-sample', 'obj.one');

                monster.view(template, {
                    context: 'obj',
                    model: model
                });

                expect(_window.sampleBinding.callCount).toBe(1);
                expect(_window.sampleBinding.argsForCall[0][0].node).toBe(template);
            });
            it('binds non direct children elements', function () {
                var newTemplate = document.createElement('div');
                newTemplate.innerHTML = '<div><div>' + template.innerHTML + '<div></div>';

                monster.view(template, {
                    context: 'obj',
                    model: model
                });

                expect(_window.sampleBinding.callCount).toBe(3);
            });
            it('binding called with correct context', function () {
                monster.view(template, {
                    context: 'obj',
                    model: model
                });

                var context = _window.sampleBinding.argsForCall[2][0];

                // node type
                expect(context.node.nodeType).toBe(1);
                expect(context.node.tagName).toBe('SPAN');
                // attribute name
                expect(context.attribute).toBe('mns-sample');
                // attribute value
                expect(context.value).toBe('obj.one');
                // got value from model correctly
                expect(context.valueFromModel).toBe('text_one');
                // got an object as controller
                expect(typeof context.controller).toBe('object');
            });
            it('binding gets multilevel property from model', function () {
                monster.view(template, {
                    context: 'obj',
                    model: model
                });

                var context = _window.sampleBinding.argsForCall[0][0];

                // got value from model correctly
                expect(context.valueFromModel).toBe('text_3');
            });
            it('binding gets null from model', function () {
                monster.view(template, {
                    context: 'obj',
                    model: model
                });

                var context = _window.sampleBinding.argsForCall[1][0];

                // got model value correctly as null
                expect(context.valueFromModel).toBe(null);
            });
            it('binding treats undefined from model as null', function () {
                model.three.four = {};
                monster.view(template, {
                    context: 'obj',
                    model: model
                });

                var context = _window.sampleBinding.argsForCall[1][0];

                // got model value correctly as null
                expect(context.valueFromModel).toBe(null);
            });
            it('binding called with specific controller', function () {
                var fakeController = {
                    someMethod: function () {}
                };

                monster.view(template, {
                    context: 'obj',
                    model: model,
                    controller: fakeController
                });

                var context = _window.sampleBinding.argsForCall[0][0];

                // got correct controller
                expect(typeof context.controller.someMethod).toBe('function');
            });
            it('view returned with methods available', function () {
                var sampleView = monster.view(template, {
                    context: 'obj',
                    model: model
                });

                // view type
                expect(typeof sampleView).toBe('object');
                // view has function constructor
                expect(typeof sampleView.constructor).toBe('function');
                // view public methods
                expect(typeof sampleView.update).toBe('function');
            });
        });
        describe('bindings', function () {
            describe('mns-text', function () {
                it('simple text value', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('p');

                    node.setAttribute('mns-text', 'person.name');
                    template.appendChild(node);

                    monster.view(template, {
                        context: 'person',
                        model: {
                            name: 'Eddie Vedder'
                        }
                    });

                    expect(node.innerHTML).toBe('Eddie Vedder');
                });
                it('numeric content treated as a string', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('p');

                    node.setAttribute('mns-text', 'person.followers');
                    template.appendChild(node);

                    monster.view(template, {
                        context: 'person',
                        model: {
                            followers: 271
                        }
                    });

                    expect(node.innerHTML).toBe('271');
                });
                it('boolean content treated as a string', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('p');

                    node.setAttribute('mns-text', 'person.available');
                    template.appendChild(node);

                    monster.view(template, {
                        context: 'person',
                        model: {
                            available: true
                        }
                    });

                    expect(node.innerHTML).toBe('true');
                });
                it('false boolean content treated as a string', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('p');

                    node.setAttribute('mns-text', 'person.available');
                    template.appendChild(node);

                    monster.view(template, {
                        context: 'person',
                        model: {
                            available: false
                        }
                    });

                    expect(node.innerHTML).toBe('false');
                });
                it('empty string binds empty string', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('p');

                    node.setAttribute('mns-text', 'person.phone');
                    template.appendChild(node);

                    monster.view(template, {
                        context: 'person',
                        model: {
                            phone: ''
                        }
                    });

                    expect(node.innerHTML).toBe('');
                });
                it('null value binds empty string', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('p');

                    node.setAttribute('mns-text', 'person.phone');
                    template.appendChild(node);

                    monster.view(template, {
                        context: 'person',
                        model: {
                            phone: null
                        }
                    });

                    expect(node.innerHTML).toBe('');
                });
                it('undefined value binds empty string', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('p');

                    node.setAttribute('mns-text', 'person.phone');
                    template.appendChild(node);

                    monster.view(template, {
                        context: 'person',
                        model: {}
                    });

                    expect(node.innerHTML).toBe('');
                });
            });
            describe('mns-attr', function () {
                it('simple text value', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-href', 'product.link');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            link: 'http://somelink.com/product/yeild'
                        }
                    });

                    expect(node.href).toBe('http://somelink.com/product/yeild');
                });
                it('simple text value for multiple hyphen attribute name', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-product-id', 'product.index');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            index: '127'
                        }
                    });

                    expect(node.getAttribute('product-id')).toBe('127');
                });
                it('simple text value with similar attribute names', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-name-one', 'product.artist');
                    node.setAttribute('mns-attr-name-two', 'product.title');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            artist: 'Pearl Jam',
                            title: 'Yield',
                            type: 'music album',
                            index: '127'
                        }
                    });

                    expect(node.getAttribute('name-one')).toBe('Pearl Jam');
                    expect(node.getAttribute('name-two')).toBe('Yield');
                });
                it('numeric value', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-product-id', 'product.index');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            index: 127
                        }
                    });

                    expect(node.getAttribute('product-id')).toBe('127');
                });
                it('simple text value plus other binding', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-href', 'product.link');
                    node.setAttribute('mns-text', 'product.title');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            link: 'http://somelink.com/product/yield'
                        }
                    });

                    expect(node.href).toBe('http://somelink.com/product/yield');
                    expect(node.innerHTML).toBe('Yield');
                });
                it('boolean value correctly bound as a string', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-in-stock', 'product.inStock');
                    node.setAttribute('mns-attr-bonus', 'product.hasBonusTracks');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            inStock: true,
                            hasBonusTracks: false
                        }
                    });

                    expect(node.getAttribute('in-stock')).toBe('true');
                    expect(node.getAttribute('bonus')).toBe('false');
                });
                it('undefined value doesn\'t insert attribute', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-alt-href', 'product.link');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album'
                        }
                    });

                    expect(node.getAttribute('alt-href')).toBe(null);
                });
                it('null value doesn\'t insert attribute', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-alt-href', 'product.link');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            link: null
                        }
                    });

                    expect(node.getAttribute('alt-href')).toBe(null);
                });
            });
            describe('mns-data', function () {
                it('simple text value', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-data-title', 'product.title');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            link: 'http://somelink.com/product/yeild'
                        }
                    });

                    expect(node.getAttribute('data-title')).toBe('Yield');
                });
                it('simple text value for multiple hyphen attribute name', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-data-product-public-id', 'product.index');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            index: '127'
                        }
                    });

                    expect(node.getAttribute('data-product-public-id')).toBe('127');
                });
                it('numeric value', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-data-product-public-id', 'product.index');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            index: 127
                        }
                    });

                    expect(node.getAttribute('data-product-public-id')).toBe('127');
                });
                it('simple text value plus other binding', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-data-href', 'product.link');
                    node.setAttribute('mns-text', 'product.title');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            link: 'http://somelink.com/product/yield'
                        }
                    });

                    expect(node.getAttribute('data-href')).toBe('http://somelink.com/product/yield');
                    expect(node.innerHTML).toBe('Yield');
                });
                it('boolean value correctly bound as a string', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-data-in-stock', 'product.inStock');
                    node.setAttribute('mns-data-bonus', 'product.hasBonusTracks');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            inStock: true,
                            hasBonusTracks: false
                        }
                    });

                    expect(node.getAttribute('data-in-stock')).toBe('true');
                    expect(node.getAttribute('data-bonus')).toBe('false');
                });
                it('undefined value doesn\'t insert attribute', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-data-href', 'product.link');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album'
                        }
                    });

                    expect(node.getAttribute('data-href')).toBe(null);
                });
                it('null value doesn\'t insert attribute', function () {
                    var template = document.createElement('div'),
                        node = document.createElement('a');

                    template.appendChild(node);
                    node.setAttribute('mns-attr-data-href', 'product.link');

                    monster.view(template, {
                        context: 'product',
                        model: {
                            title: 'Yield',
                            type: 'music album',
                            link: null
                        }
                    });

                    expect(node.getAttribute('data-href')).toBe(null);
                });
            });
            describe('mns-show', function () {
                var template,
                    node;
                beforeEach(function() {
                    template = document.createElement('div');
                    node = document.createElement('div');

                    node.setAttribute('mns-show', 'person.hasChildren');
                    template.appendChild(node);
                });
                afterEach(function () {
                    template = node = null;
                });
                it('shows node with true boolean value', function () {
                    monster.view(template, {
                        context: 'person',
                        model: {
                            hasChildren: true
                        }
                    });

                    expect(node.style.display).toBe('block');
                });
                it('shows node with non-zero numeric value', function () {
                    monster.view(template, {
                        context: 'person',
                        model: {
                            hasChildren: 2
                        }
                    });

                    expect(node.style.display).toBe('block');
                });
                it('hides node with false boolean value', function () {
                    monster.view(template, {
                        context: 'person',
                        model: {
                            hasChildren: false
                        }
                    });

                    expect(node.style.display).toBe('none');
                });
                it('hides node with zero numeric value', function () {
                    monster.view(template, {
                        context: 'person',
                        model: {
                            hasChildren: 0
                        }
                    });

                    expect(node.style.display).toBe('none');
                });
                it('hides node with undefined value', function () {
                    monster.view(template, {
                        context: 'person',
                        model: {}
                    });

                    expect(node.style.display).toBe('none');
                });
                it('hides node with null value', function () {
                    monster.view(template, {
                        context: 'person',
                        model: {
                            hasChildren: null
                        }
                    });

                    expect(node.style.display).toBe('none');
                });
            });
            describe('mns-on', function () {
                var _controller,
                    template,
                    node;

                beforeEach(function () {
                    window.sampleMethod = function () {
                        return true;
                    };

                    _controller = {
                        sampleMethod: function () {
                            return true;
                        }
                    };

                    template = document.createElement('div');
                    node = document.createElement('button');
                    node.setAttribute('mns-on-click', 'sampleMethod');
                    template.appendChild(node);

                    spyOn(window, 'sampleMethod');

                    spyOn(_controller, 'sampleMethod');
                });
                afterEach(function () {
                    window.sampleMethod = null;
                    _controller = template = node = null;
                });
                it('binds method without controller namespace', function () {
                    monster.view(template, {
                        context: 'sample',
                        model: {}
                    });

                    node.click();

                    expect(window.sampleMethod).toHaveBeenCalled();
                });
                it('binds method with controller namespace', function () {
                    monster.view(template, {
                        context: 'sample',
                        model: {},
                        controller: _controller
                    });

                    node.click();

                    expect(_controller.sampleMethod).toHaveBeenCalled();
                });
                it('does not bind non function objects', function () {
                    monster.view(template, {
                        context: 'sample',
                        model: {},
                        controller: {
                            sampleMethod: []
                        }
                    });

                    node.click();

                    // expect no errors
                    expect(true).toBe(true);
                });
                it('does not throw error if the method does not exist', function () {
                    monster.view(template, {
                        context: 'sample',
                        model: {},
                        controller: {}
                    });

                    node.click();

                    // expect no errors
                    expect(true).toBe(true);
                });
            });
            describe('mns-each', function () {
                var template,
                    node;

                beforeEach(function () {
                    template = document.createElement('div');
                    node = document.createElement('ul');
                    node.setAttribute('mns-each-animal', 'data.animals');
                    node.innerHTML = '<li><p mns-text="animal.clade"></p>' +
                        '<h2 mns-text="animal.name"></h2>' +
                        '<span mns-show="animal.extinct">extinct</span>' +
                        '</li>';
                    template.appendChild(node);
                });
                afterEach(function () {
                    template = node = null;
                });
                it('binds array and generates correct number of elements', function () {
                    monster.view(template, {
                        context: 'data',
                        model: {
                            'animals': [
                                {
                                    clade: 'Dinosauria',
                                    name: 'Apatosaurus',
                                    extinct: true
                                },
                                {
                                    clade: 'Felidae',
                                    name: 'Tiger',
                                    extinct: false
                                },
                                {
                                    clade: 'Cetacea',
                                    name: 'Bowhead Whale',
                                    extinct: false
                                },
                                {
                                    clade: 'Aves',
                                    name: 'Dodo',
                                    extinct: true
                                },
                                {
                                    clade: 'Insecta',
                                    name: 'Coccinellidae',
                                    extinct: false
                                }
                            ]
                        }
                    });

                    expect(node.children.length).toBe(5);
                });
                it('binds array and generates correct data', function () {
                    monster.view(template, {
                        context: 'data',
                        model: {
                            'animals': [
                                {
                                    clade: 'Dinosauria',
                                    name: 'Apatosaurus',
                                    extinct: true
                                },
                                {
                                    clade: 'Felidae',
                                    name: 'Tiger',
                                    extinct: false
                                }
                            ]
                        }
                    });

                    // first element data
                    expect(node.children[0].children[0].innerHTML).toBe('Dinosauria');
                    expect(node.children[0].children[1].innerHTML).toBe('Apatosaurus');
                    expect(node.children[0].children[2].style.display).toBe('block');

                    // second element data
                    expect(node.children[1].children[0].innerHTML).toBe('Felidae');
                    expect(node.children[1].children[1].innerHTML).toBe('Tiger');
                    expect(node.children[1].children[2].style.display).toBe('none');
                });
                it('binds empty array and leaves no elements', function () {
                    monster.view(template, {
                        context: 'data',
                        model: {
                            'animals': []
                        }
                    });

                    expect(node.children.length).toBe(0);
                });
                it('binds object and generates correct number of elements', function () {
                    monster.view(template, {
                        context: 'data',
                        model: {
                            'animals': {
                                1: {
                                    clade: 'Dinosauria',
                                    name: 'Apatosaurus',
                                    extinct: true
                                },
                                2: {
                                    clade: 'Felidae',
                                    name: 'Tiger',
                                    extinct: false
                                },
                                3: {
                                    clade: 'Cetacea',
                                    name: 'Bowhead Whale',
                                    extinct: false
                                },
                                4: {
                                    clade: 'Aves',
                                    name: 'Dodo',
                                    extinct: true
                                },
                                5: {
                                    clade: 'Insecta',
                                    name: 'Coccinellidae',
                                    extinct: false
                                }
                            }
                        }
                    });

                    expect(node.children.length).toBe(5);
                });
                it('binds empty object and generates no elements', function () {
                    monster.view(template, {
                        context: 'data',
                        model: {
                            'animals': {}
                        }
                    });

                    expect(node.children.length).toBe(0);
                });
                it('binds with unwrapped template', function () {
                    node.innerHTML = '<p mns-text="animal.clade"></p>' +
                        '<h2 mns-text="animal.name"></h2>' +
                        '<span mns-show="animal.extinct">extinct</span>';

                    monster.view(template, {
                        context: 'data',
                        model: {
                            'animals': [
                                {
                                    clade: 'Dinosauria',
                                    name: 'Apatosaurus',
                                    extinct: true
                                },
                                {
                                    clade: 'Felidae',
                                    name: 'Tiger',
                                    extinct: false
                                },
                                {
                                    clade: 'Cetacea',
                                    name: 'Bowhead Whale',
                                    extinct: false
                                },
                                {
                                    clade: 'Aves',
                                    name: 'Dodo',
                                    extinct: true
                                },
                                {
                                    clade: 'Insecta',
                                    name: 'Coccinellidae',
                                    extinct: false
                                }
                            ]
                        }
                    });

                    expect(node.children.length).toBe(15);
                });
            });
        });
        describe('errors', function () {
            var e;
            beforeEach(function () {
                e = 'not an error';
            });
            afterEach(function () {
                e = null;
            });
            it('when called with a non valid template', function () {
                try {
                    monster.view('not a template', { context: 'context', model: {} });
                } catch (err) {
                    e = err;
                }
                expect(e instanceof Error).toBe(true);
                expect(e.message).toBe('monster.view: You must pass a valid template as a first argument');
            });
            it('when called without a configuration object', function () {
                try {
                    monster.view(document.createElement('div'));
                } catch (err) {
                    e = err;
                }
                expect(e instanceof Error).toBe(true);
                expect(e.message).toBe('monster.view: You must specify a context and a model');
            });
            it('when called without a context', function () {
                try {
                    monster.view(document.createElement('div'), { model: {} });
                } catch (err) {
                    e = err;
                }
                expect(e instanceof Error).toBe(true);
                expect(e.message).toBe('monster.view: You must specify a context and a model');
            });
            it('when called without a model', function () {
                try {
                    monster.view(document.createElement('div'), { context: 'context' });
                } catch (err) {
                    e = err;
                }
                expect(e instanceof Error).toBe(true);
                expect(e.message).toBe('monster.view: You must specify a context and a model');
            });
        });
    });

    describe('monster.clean', function () {
        describe('delete binding', function () {
            var template,
                node,
                model,
                context,
                controller,
                _window;

            beforeEach(function() {
                node = document.createElement('p');
                node.setAttribute('mns-sample', 'content.info');
                template = document.createElement('div');
                template.appendChild(node);
                model = {
                    info: 'text'
                };
                context = 'content';
                controller = {};

                // set sample method to check if binding is called
                _window = {
                    sampleBinding: function (context) {
                        var opt = context;
                        return opt;
                    }
                };

                // spy on binding
                spyOn(_window, 'sampleBinding');

                // sets new binding
                monster.binding('sample', _window.sampleBinding);
            });
            afterEach(function () {
                template = model = context = controller = _window = null;
            });
            it('binding is no longer available', function () {
                monster.clean('sample');
                monster.view(template, {context: context, model: model, controller: controller});
                expect(_window.sampleBinding).not.toHaveBeenCalled();
            });
            it('deleting unxisting binding doesn\'t throw an error', function () {
                monster.clean('sample');
                monster.clean('sample');
            });
        });
        describe('errors', function () {
            var e;
            beforeEach(function () {
                e = 'not an error';
            });
            afterEach(function () {
                e = null;
            });
            it('when called without name argument', function () {
                try {
                    monster.clean();
                } catch (err) {
                    e = err;
                }
                expect(e instanceof Error).toBe(true);
                expect(e.message).toBe('monster.clean: name must be a string');
            });
            it('when called with a non valid name', function () {
                try {
                    monster.clean(123);
                } catch (err) {
                    e = err;
                }
                expect(e instanceof Error).toBe(true);
                expect(e.message).toBe('monster.clean: name must be a string');
            });
        });
    });

    describe('monster.binding', function () {
        describe('setting a new binding', function () {
            var template,
                node,
                model,
                context,
                controller,
                _window;

            beforeEach(function() {
                node = document.createElement('p');
                node.setAttribute('mns-sample', 'content.info');
                template = document.createElement('div');
                template.appendChild(node);
                model = {
                    info: 'text'
                };
                context = 'content';
                controller = {};

                // set sample method to check if binding is called
                _window = {
                    sampleBinding: function (context) {
                        var opt = context;
                        return opt;
                    }
                };

                // spy on binding
                spyOn(_window, 'sampleBinding');
            });
            afterEach(function () {
                monster.clean('sample');
                template = model = context = controller = _window = null;
            });
            it('binding is available and called', function () {
                monster.binding('sample', _window.sampleBinding);
                monster.view(template, {context: context, model: model});

                expect(_window.sampleBinding).toHaveBeenCalled();
            });
            it('binding is called with the correct options', function () {
                monster.binding('sample', _window.sampleBinding);
                monster.view(template, {context: context, model: model, controller: controller});

                expect(_window.sampleBinding).toHaveBeenCalledWith({
                    node: node,
                    attribute: 'mns-sample',
                    value: 'content.info',
                    valueFromModel: 'text',
                    controller: {}
                });
            });
        });
        describe('errors', function () {
            var e;
            beforeEach(function () {
                e = 'not an error';
            });
            afterEach(function () {
                e = null;
                monster.clean('new_binding');
            });
            it('when called with non valid name', function () {
                try {
                    monster.binding(123, function () {});
                } catch (err) {
                    e = err;
                }
                expect(e instanceof Error).toBe(true);
                expect(e.message).toBe('monster.binding: name must be a string');
            });
            it('when called without a method', function () {
                try {
                    monster.binding('new_binding');
                } catch (err) {
                    e = err;
                }
                expect(e instanceof Error).toBe(true);
                expect(e.message).toBe('monster.binding: you must specify a method');
            });
            it('when called with a non valid method', function () {
                try {
                    monster.binding('new_binding', {});
                } catch (err) {
                    e = err;
                }
                expect(e instanceof Error).toBe(true);
                expect(e.message).toBe('monster.binding: you must specify a method');
            });
            it('when called with an already existing binding name', function () {
                monster.binding('new_binding', function () {});
                try {
                    monster.binding('new_binding', function () {});
                } catch (err) {
                    e = err;
                }
                expect(e instanceof Error).toBe(true);
                expect(e.message).toBe('monster.binding: a binding with this name already exists');
            });
        });
    });
});