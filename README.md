# mnster [![Build Status](https://travis-ci.org/jeremenichelli/mnster.svg)](https://travis-ci.org/jeremenichelli/mnster)

A simple data binding library to cover the basic needs and with the possibility to expand its bindings in a very simple way. Keep going through this document and you'll see how.

## Install

If you want to use ```mnster```in your project you can just add a script tag to it.

```
<script src="assets/scripts/mnster.js"></script>
```

It's also available in *npm* and *bower* if you are using any of these package managers.

```
npm install mnster --save
```

```
bower install mnster --save
```

### mnster.view

As most of the libraries of its kind, **mnster** will let you fill the content of an HTML template by calling the *view* function, you only need to pass a template (node), a context (string) and the model of the view (object).

```js
var template = document.createElement('p');
template.setAttribute('mns-text', 'me.name');

mnster.view(template, { context: 'me', model: { name: 'John Oliver' } });
```

Yes! It's that simple.

As you might notice you will need to add some attributes that must start with **mns-** and then continue with the name of the binding and depending on it some other information. The value of that attribute needs to start with the name of the context and then the property.

You can have as many properties as you want.

```js
var template = document.createElement('p');
template.innerHTML = '<span mns-text="me.name.first"></span> ' +
    '<span mns-text="me.name.last"></span>';

mnster.view(
    template, {
        context: 'me',
        model: {
            name: {
                first: 'John',
                last: 'Oliver'
            }
        }
    });
```

You can create the template and later append it to the body of the document or get just it from the DOM and generate a view, both will work good and of course you have other bindings available.


### bindings

Here are the things you can do with **mnster** with just adding it to your project.
*If the property you declared in the binding attribute is not found *mnster* won't add nothing to the node.*

#### mns-text

Sets the text content of an element.

```html
<p mns-text="user.name"></p>
```

#### mns-html

Inserts HTML content to an element.

```html
<p mns-text="user.name"></p>
```

#### mns-attr-[ATTRIBUTE_NAME]

Adds an atribute and its value to the element.

```html
<img mns-attr-src="user.avatar" alt="">
```

#### mns-data-[ATTRIBUTE_NAME]

Adds a data atribute and its value to the element.

```html
<img mns-data-src="user.avatar" alt="">
```

#### mns-show

Shows the element if the value form the model is true.

```html
<button mns-show="user.isFree">You can hire me!</button>
```

#### mns-hide

Hides the element if the value form the model is true.

```html
<button mns-hide="user.hasAJob">You can hire me!</button>
```

#### mns-on-[EVENT]

Sets an event in the element. It can be global or inside a controller. When you declare a view you are able to add a controller as a configuration, if you don't specify that then **mnster** will asume the method is global.

```js
ctrl = {
    showMessage: function() {
        alert('Click triggered!');
    }
};

mnster.view(
    template, {
        context: 'me',
        model: {},
        controller: ctrl
        }
    });
```

```html
<button mns-on-click="showMessage">alert!</button>
```

#### mns-each-[ITEM]

Generates content for every item in the model.

```html
<ul mns-each-job="user.jobs">
    <li>
        <span mns-text="job.role"></span> in <span mns-text="job.company"></span>
    </li>
</ul>
```

**Note:** You may notice that there aren't a lot of bindings available. The reason is that I usually don't like to include code in my projects that doesn't end up being used. So I prefer to keep the bindings to minimum, this means less file size and faster loading times.

*But I need other bindings!* Yes, there's a chance you might need more bindings, that's why **mnster** allows you to declare bindings in a very easy way. You can *feed your mnster* with as much bindings as you want.


### Declaring new bindings

If you need to extend the funcitonality of this library, you can use the ```mnster.binding``` method. First of all, remember that any binding attribute must start with *mns-* followed by the binding name itself and after that you can add as much letters and hyphens as you want. You'll also need a function that does the trick, for that **mnster** will give you a context object with all the values you need to apply your binding. 

Every context object will contain this properties:
- **context.node** element that holds the binding attribute
- **context.attribute** name of the attribute
- **context.value** value of the attribute
- **context.valueFromModel** value of the property in the model, if it's not define it will return *null*.
- **context.controller** controller declared in the view

Let's see our first example, here the context object that the **mns-text** receives contains these values:

```js
var template = document.createElement('p');
template.setAttribute('mns-text', 'me.name');

mnster.view(template, { context: 'me', model: { name: 'John Oliver' } });
```

- **context.node** template (node)
- **context.attribute** 'mns-text' (string)
- **context.value** 'me.name'
- **context.valueFromModel** 'John Oliver' (string)
- **context.controller** window object

You can check the source code and see how the *mns-attr* works.

```js
mnster.binding('attr', function (context) {
    var node = context.node,
        attr = context.attribute.replace('mns-attr-', ''),
        value = context.valueFromModel;

    if (attr && value !== null) {
        node.setAttribute(attr, value + '');
    }
});
```

We use **context.attribute** value and replace the first part of it to get the actual attribute name that needs to be added. Then we get **context.valueFromModel** and if it's not null and if the attribute anme is not an empty string it is set to the element.

*You can add as many bindings as you want.*


### Change binding prefix

If you don't like ```mns-``` as the prefix you can change it calling ```mnster.prefix``` and passing a valid string.

```js
mnster.prefix('data');
```


### Size

- **mnster.js** 8.95KB
- **mnster.min.js** 2.35KB
- **gzipped mnster.min.js** 1.16KB


### Contribution

This is the first version of this library. Feel free to use it, explore it, propose changes and bindings or rise issues <a href="https://github.com/jeremenichelli/mnster/issues" target="_blank">here</a>. It's open for everyone.


*feed your mnster and happy coding!*





