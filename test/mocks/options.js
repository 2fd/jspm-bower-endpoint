module.exports = {

    timeouts: {
        lookups: 60,
        download: 300,
        build: 120
    },

    tmpDir: './test/assets/.jspm',

    apiVersion: '1.0',

    handler: 'jspm-bower-endpoint',

    name: 'bower-endpoint',

    versionString: 'jspm-bower-endpoint@0.1'

};