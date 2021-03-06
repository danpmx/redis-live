'use strict';

var Redis = require('ioredis'),
    nconf = require('nconf'),
    debug = require('debug')('redis-live');

const prefix = 'status:'

let redis = nconf.get('cluster') ? new Redis.Cluster(nconf.get('cluster'), { redisOptions: nconf.get('options')}) : new Redis(nconf.get('server')); 
redis.on("connect", () => debug('established redis connection for configServer'));
redis.on("error", (err) => debug('error on redis connection for configServer. retry should be invoked: ' + err));

exports.register = function (server, options, next) {

    // WebApi
    server.route({
        method: 'POST',
        path: '/stats',
        handler: (request, reply) => {
            let type = request.payload.type;
            let host = request.payload.host.split(':')[0];
            let port = request.payload.host.split(':')[1];

            // period will be set to either hourly, daily or raw... if raw, then omit this from the key lookup
            let period = request.payload.period;
            period = period == 'raw' ? period = ':' : period = ':' + period + ':';

            debug('quering: ' + prefix + host + ':' + port + period + type);
            // get all the keys in the set for this server:port:type
            redis.zrangebyscore(prefix + host + ':' + port + period + type, '-inf', '+inf', (err, results) => {                
                return reply(results.map((a) => JSON.parse(a)).map((a) => {delete a.n; return a}));                
            });

        }
    });

    next();
}

exports.register.attributes = {
    'name': 'stats'
};