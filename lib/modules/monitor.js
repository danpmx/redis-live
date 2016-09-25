'use strict';

const RedisStats = require('redis-stats'),
    nconf = require('nconf'),
    path = require('path');

nconf.env().file({file: path.resolve(__dirname, '../../config/config.json')});


// start monitoring
let redisStats = new RedisStats({
    interval: 60,
    servers: nconf.get('cluster'),
    redisOptions: nconf.get('options'),
    stats: ['uptime_in_seconds', 'used_memory', 'connected_clients'],
    cluster: true,
    maxItems: 400
});
redisStats.initialize();