require('dotenv').config()

module.exports = {
    CORE: {
        PORT: process.env.PORT || 8000,
        S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || "",
        S3_SECRET_KEY: process.env.S3_SECRET_KEY || "",
        MONGO_URI: process.env.MONGODB_URI || "",
        PASSWORD_DEFAUL: process.env.PASSWORD_DEFAUL || '123456',
        SECRET_KEY: process.env.SECRET_KEY || 'NamHandsomee',
        SECRET_KEY_MAIL: process.env.SECRET_KEY_MAIL || 'NAMPRO',
        WEBSITE_URL: process.env.WEBSITE_URL || 'http://localhost:3000'
    }
}