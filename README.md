gulp-connect-ssi
===========

SSI(Server Side Includes) Middleware for [gulp-connect],support  get or download included files online

## Install

```shell
npm install gulp-connect-ssi
```

## Examples

### In your html file

Uses [node-ssi], supports all of the following:

<!--# include file="path" -->

<!--# set var="k" value="v" -->

<!--# echo var="n" default="default" -->

<!--# if expr="test" -->
<!--# elif expr="" -->
<!--# else -->
<!--# endif -->


### Using [gulp-connect]

``` javascript
var gulpConnect = require('gulp-connect');
var gulpConnectSsi = require('gulp-connect-ssi');

gulp.task('connect', function () {
    gulpConnect.server({
        root: _.app,
        port: process.env.HAMMER_DEV_PORT || 80,
        livereload: true,
        middleware:function(){
            return [gulpConnectSsi({
                baseDir: __dirname + '/app',
                ext:'.html',
                domain: 'http://example.com/',
                method: 'readOnLineIfNotExist' //readOnLine|readLocal|readOnLineIfNotExist|downloadIfNotExist
            })];
        }
    });
});
```


[gulp-connect]: https://github.com/avevlad/gulp-connect
[node-ssi]: https://github.com/yanni4night/node-ssi
