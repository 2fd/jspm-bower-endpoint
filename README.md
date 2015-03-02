# JSPM Bower Endpoint
[![License](https://img.shields.io/npm/l/jspm-bower-endpoint.svg?style=flat-square)](https://github.com/2fd/jspm-bower-endpoint/blob/master/LICENSE)
[![Build Status](https://img.shields.io/travis/2fd/jspm-bower-endpoint.svg?style=flat-square)](https://travis-ci.org/2fd/jspm-bower-endpoint)
[![NPM](https://img.shields.io/npm/v/jspm-bower-endpoint.svg?style=flat-square)](https://www.npmjs.com/package/jspm-bower-endpoint)
[![Release](https://img.shields.io/github/release/2fd/jspm-bower-endpoint.svg?style=flat-square)](https://github.com/2fd/jspm-bower-endpoint/releases)


Bower command-line adapter from jspm

## Install
```bash
    
   npm install -g jspm-bower-endpoint
    
```

## Add enponit
```bash
    
    jspm endpoint create bower jspm-bower-endpoint
    
```

## Use
```bash
    
    jspm install bower:skeleton
    
```

or 

```bash
    
    jspm install skeleton=bower:skeleton
    
```

## Features

### Automatic main resolve from bower

Find and use the js file

```javascript
    
    // bower.json
    {
        "main" : [
            "less/bootstrap.less",
            "dist/css/bootstrap.css",
            "dist/js/bootstrap.js",
            "dist/fonts/glyphicons-halflings-regular.eot",
            "dist/fonts/glyphicons-halflings-regular.svg",
            "dist/fonts/glyphicons-halflings-regular.ttf",
            "dist/fonts/glyphicons-halflings-regular.woff",
            "dist/fonts/glyphicons-halflings-regular.woff2"
        ]
    }
    
    //resolve
    {
        "main" : "dist/js/bootstrap.js"
    }
    
```

Use `main:false` if cannot solve in a single file or main does not include a js file

```javascript
    
    // bower.json
    {
       "main" : [
           "dist/js/bootstrap.js",
           "dist/js/bootstrap.min.js"
       ]
    }
    
    //resolve
    {
        "main" : false
    }  
    
```


```javascript
    
    // bower.json
    {
        "main": "css/skeleton.css"
    }
    
    //resolve
    {
        "main" : false
    }  
    
```


### Automatic css dependencies

If main includes css files, the css-plugin is added to the dependencies

```javascript
    
    // bower.json
    {
        "main" : [
            "less/bootstrap.less",
            "dist/css/bootstrap.css",
            "dist/js/bootstrap.js",
            "dist/fonts/glyphicons-halflings-regular.eot",
            "dist/fonts/glyphicons-halflings-regular.svg",
            "dist/fonts/glyphicons-halflings-regular.ttf",
            "dist/fonts/glyphicons-halflings-regular.woff",
            "dist/fonts/glyphicons-halflings-regular.woff2"
        ],
        "dependencies": {
            "jquery": ">= 1.9.1"
        }
    }
    
    //resolve
    {
        "main" : "dist/js/bootstrap.js",
        "dependencies": {
            "jquery": "jquery@>=1.9.1",
            "css": "jspm:css@*"
        }
    }
    
```

In the case of the package without js files is necessary install the css-plugin directly in project through run `jspm install css`
```javascript
    
    // bower.json
    {
        "main": "css/skeleton.css",
        "dependencies": {}
    }
    
    //resolve
    {
        "main" : false,
        "dependencies": {
            "css": "jspm:css@*"
        }
    }  
    
```

### Automatic format property
> jspm-bower-endpoint >= 0.2.0

If moduleType property is defined in bower package,
the format property can be defined properly

```javascript
    
    // bower.json
    {
        "moduleType": [
            "amd",
            "globals",
            "node"
        ]
    }
    
    //resolve
    {
        "format" : "cjs"
    }  

```

By default, global format is used.
if you need use other format, use the override flag

```bash
    
    ## Use jquery in amd mode
    jspm install bower:jquery -o "{ format:'amd', main:'src/jquery.js'}"
    
```
