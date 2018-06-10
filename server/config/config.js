const config = {

    production:{
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI,
        PORT: process.env.PORT,
        BUCKET_NAME: process.env.S3_BUCKET_NAME,
        IAM_USER_KEY: process.env.AWS_ACCESS_KEY_ID,
        IAM_USER_SECRET: process.env.AWS_SECRET_ACCESS_KEY
    },

    default:{
        SECRET: 'NOTSECRET93PASSWORD',
        DATABASE: 'mongodb://localhost:27017/SSN',
        PORT: 3001,
        BUCKET_NAME: '',
        IAM_USER_KEY: '',
        IAM_USER_SECRET: ''
    }
}


exports.get = function get(env) {
    return config[env] || config.default
}