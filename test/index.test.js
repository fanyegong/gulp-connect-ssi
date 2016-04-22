/**
 * Created by fanyegong on 2016/4/22.
 */
var request = require('supertest');
var express = require('express');
var expect = require('chai').expect;


describe('gulp-connect-ssi test', function () {

    describe('test when method is readOnLineIfNotExist', function () {
        var app = express();
        var gulpConnectSsi = require('../index.js');

        app.use('/', gulpConnectSsi({
            baseDir: 'test/includes',
            ext: '.html',
            domain: 'http://example.com/',
            method: 'readOnLineIfNotExist',  // readOnLine|readLocal|readOnLineIfNotExist|downloadIfNotExist
            onlineEncoding: 'GBK',
            localEncoding: 'utf8'
        }));

        it('Should include local file when  exist local file ', function(done) {
            request(app)
                .get('/')
                .expect(/abcdef/)
                .end(done);
        });

        it('Should get online when no local file', function(done) {
            request(app)
                .get('/')
                .expect(/Example Domain/)
                .end(done);
        });
    });
});

