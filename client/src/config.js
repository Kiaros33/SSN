const config = {

    production:{
        GOOGLE_KEY: process.env.GOOGLE_KEY,
        SOCKET: process.env.SOCKET
    },

    default:{
        GOOGLE_KEY: '945274229124-5astasev3jr15rohtv5a4l24g5qmubki.apps.googleusercontent.com',
        SOCKET: 'http://192.168.1.39:3001'
    }
}


exports.get = function get(env) {
    return config[env] || config.default
}