/**
 * Created by fanyegong on 2016/4/14.
 */
/*eslint-env node, node */
'use strict';

var fs = require('fs');
var http = require('http');
var url = require('url');
var path = require('path');

var SSI = require('node-ssi');
var parseurl = require('parseurl');
var async = require('async');
var extend = require('extend');
var iconv = require('iconv-lite');


SSI.prototype.methodResolve = function(tpath, dPath, options){

    var download = function(url, dest, cb) {
        fs.mkdirSync(path.dirname(dest));

        var file = fs.createWriteStream(dest);
        http.get(url, function(res) {
            res.pipe(iconv.decodeStream(options.onlineEncoding))
            .pipe(iconv.encodeStream(options.localEncoding))
            .pipe(file);
            file.on('finish', function() {
                file.close(cb);
            });
        }).on('error', function(err) { // Handle errors
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
            if (cb) {
                cb(err.message);
            }
        });
    };

    var promise = new Promise(function(resolve, reject) {
        if (options.method === 'readOnLine') {
            resolve('readOnLine');
        } else if (options.method === 'readLocal') {
            resolve('readLocal');
        } else if (options.method === 'readOnLineIfNotExist') {
            if (fs.existsSync(tpath)) {
                resolve('readLocal');
            } else {
                resolve('readOnLine');
            }
        } else if (options.method === 'downloadIfNotExist') {
            if (fs.existsSync(tpath)) {
                resolve('readLocal');
            } else {
                download(dPath, tpath, function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve('readLocal');
                });
            }
        }
    });

    return promise;
};


SSI.prototype.resolveIncludes = function (content, options, callback){
    var matches, seg, isVirtual, basePath, tpath, subOptions, self = this;

    /**
     * @func insertInclude
     * @param {Object} next next
     * @returns {String} content content
     */
    function insertInclude(next){
        seg = matches[0];
        isVirtual = RegExp.$1 === 'virtual';
        basePath = (isVirtual && options.dirname && RegExp.$3.charAt(0) !== '/') ? options.dirname : options.baseDir;
        tpath = path.join(basePath, RegExp.$3);
        var promise = self.methodResolve(tpath, url.resolve(options.domain, matches[3]), options);
        promise.then(function(value){
            if (value === 'readOnLine'){
                http.get(url.resolve(options.domain, matches[3]), function(res) {
                    var chunks = [];
                    res.on('data', function(chunk) {
                        chunks.push(chunk);
                    }).on('end', function() {
                        var innerContentRaw = iconv.decode(Buffer.concat(chunks), options.onlineEncoding);
                        subOptions = extend({}, options, {dirname: path.dirname(tpath)});
                        self.resolveIncludes(innerContentRaw, subOptions, function(err, innerContent) {
                            if (err) {
                                return next(err);
                            }
                            content = content.slice(0, matches.index) + innerContent + content.slice(matches.index + seg.length);
                            next(null, content);
                        });
                    });

                }).on('error', function(err) {
                    return next(err);
                });
            } else {
                fs.readFile(tpath, {
                    encoding: options.encoding
                }, function(err, innerContentRaw) {
                    if (err) {
                        return next(err);
                    }
                    // ensure that included files can include other files with relative paths
                    subOptions = extend({}, options, {dirname: path.dirname(tpath)});
                    self.resolveIncludes(innerContentRaw, subOptions, function(err, innerContent) {
                        if (err) {
                            return next(err);
                        }
                        content = content.slice(0, matches.index) + innerContent + content.slice(matches.index + seg.length);
                        next(null, content);
                    });
                });
            }
        });

    }


    async.whilst(
        function test() {
            return !!(matches = self.regExps.includeFileReg.exec(content));
        },
        insertInclude,
        function includesComplete(err) {
            if (err) {
                return callback(err);
            }
            return callback(null, content);
        }
    );
};


/**
 *
 * @param {Object} opt opt
 * @return {function} gulp-connect-ssi 'plugin for gulp-connect'
 */
module.exports = function(opt){
    /**
     *
     * @type {{baseDir: string, method: string}}
     * @property {String} method - readOnLine|readLocal|readOnLineIfNotExist|downloadIfNotExist
     */
    var defaults = {
        baseDir: '.',
        ext: '.html',
        domain: '.',
        method: 'readOnLineIfNotExist',
        onlineEncoding: 'utf8',
        localEncoding: 'utf8'
    };

    opt = Object.assign(defaults, opt);

    var ssi = new SSI(opt);

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    return function(req, res, next) {

        var url = parseurl(req).pathname;

        url = /\/$/.test(url) ? (url + 'index' + opt.ext) : url;

        if (!endsWith(url, opt.ext)) {
            return next();
        }

        var filePath = path.join(opt.baseDir, url);

        ssi.compileFile(filePath, function(err, content){
            if (err) {
                // let 404 errors pass on to the default 404 handler
                // but only for the file we were trying to load.
                // If err.path is different, then it means that there was an include that could not be found.
                if (err.code === 'ENOENT' && err.path === filePath) {
                    return next();
                }
                // handle other errors here
                return next(err);
            }
            res.end(content);
        });
    };
};

