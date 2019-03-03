# ts-optimizer
Set of TypeScript transformers that optimize your code before compilation

> ⚠️ !!! This module is on Proof of Concept stage, please, be careful using it in production !!!

## How to use
### Installation
```shel
npm i -D ts-optimizer
```

### Webpack integration
```js
const path = require('path');

// Your webpack config...
{
    test: /\.tsx?$/,
    use: [
        {
            loader: 'ts-loader', // or 'awesome-typescript-loader'
            options: {
                getCustomTransformers: path.join(__dirname, './node_modules/ts-optimizer/lib/ts-transformers.js')
            }
        }
    ]
}
```

or you can create your own transformers list:

```js
// your-transformers.js
module.exports = function getCustomTransformers() {
    return {
        before: [
            require('ts-optimizer/lib/transformers/jsx-attribute')({
                attributesWithTemplateLiterals: ['className', 'class']
            }),
            require('ts-optimizer/lib/transformers/class-arrow-function-property')()
        ]
    };
};

```

and pass it to options

```js
{
    test: /\.tsx?$/,
    use: [
        {
            loader: 'ts-loader', // or 'awesome-typescript-loader'
            options: {
                getCustomTransformers: path.join(__dirname, './your-transformers.js')
            }
        }
    ]
}
```

## Transformers
### Template Literals in JSX attributes 
This transformer removes unnecessary spaces in template literals in JSX attributes.
By default it processes `className` and `class` attributes.

**Input:**
```tsx
class Button {
    render () {
        return (
            <button disabled
                    className={`
                        ${className1}
                        ${className2}
                        ${className3}
                    `}
            />
        );
    }
}
```

**Output:**
```tsx
class Button {
    render () {
        return (
            <button disabled
                    className={`${className1} ${className2} ${className3}`}
            />
        );
    }
}
```

### Arrow functions as class properties
This transformer converts arrow functions from class properties to bound class methods.

**Input:**
```ts
class Button {
    private fn1 = (a, b) => {};
    private fn1 = (a, b, c) => {};
    protected fn2 = () => {};
    fn3 = () => 2 
}
```

**Output:**
```ts
class Button {
    constructor () {
        this.fn1 = this.fn1.bind(this);
        this.fn2 = this.fn2.bind(this);
        this.fn3 = this.fn3.bind(this);
    }

    private fn1 (a, b) {};
    protected fn2 () {};
    fn3 () {
        return 2;
    } 
}
```