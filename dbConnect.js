const mongoose = require('mongoose');
const mongoUrl = process.env.MONGO_URL

async function connecting() {
    try {

        mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log(`MongoDB connected`);
            })

    } catch (e) {
        console.log(e);
        process.exit(1);
    }

}


module.exports = connecting;