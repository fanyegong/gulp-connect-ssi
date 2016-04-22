gulp-connect-ssi [![Build Status](https://travis-ci.org/fanyegong/gulp-connect-ssi.png)](https://travis-ci.org/fanyegong/gulp-connect-ssi)
===========

SSI(Server Side Includes) Middleware for [gulp-connect],support  get or download included files online

## Install

```shell
npm install gulp-connect-ssi
```

## Examples

### In your html file

Uses [node-ssi], supports all of the following:

```
<!--# include file="path" -->

<!--# include virtual="path" -->

<!--# set var="k" value="v" -->

<!--# echo var="n" default="default" -->

<!--# if expr="test" -->
<!--# elif expr="" -->
<!--# else -->
<!--# endif -->
```

### Using [gulp-connect]

``` javascript
var gulp = require('gulp'),
    gulpConnect = require('gulp-connect');
    gulpConnectSsi = require('gulp-connect-ssi');

gulp.task('connect', function () {
    gulpConnect.server({
        root: _.app,
        port: 80,
        livereload: true,
        middleware: function(){
            return [gulpConnectSsi({
                baseDir: __dirname + '/app',
                ext: '.html',
                domain: 'http://example.com/',
                method: 'readOnLineIfNotExist'  // readOnLine|readLocal|readOnLineIfNotExist|downloadIfNotExist
            })];
        }
    });
});
```
## API

### options.baseDir

Type: `String`
Default: `Directory with gulpfile`

The root path

### options.ext

Type: `String`
Default: `.shtml`

File extension,only url ending in this will be evaluated.

### options.domain

Type: `String`
Default: `.`

The domain you want to read or download you included files from.

### options.method

Type: `String`
Default: `readOnLineIfNotExist`

SSI process methods,can be any of following options:
`readOnLine` | `readLocal` | `readOnLineIfNotExist` | `downloadIfNotExist`

### options.onlineEncoding

Type: `String`
Default: `utf8`

File encoding of online files

Supported encodings:GBK,utf8,etc. 

See [all supported encodings on iconv-lite wiki](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings).

### options.localEncoding

Type: `String`
Default: `utf8`

File encoding of local files


[gulp-connect]: https://github.com/avevlad/gulp-connect
[node-ssi]: https://github.com/yanni4night/node-ssi
