const mongoose = require('mongoose');
const mongoUrl = "mongodb+srv://abhishek001:Bzwx4cVjhkR7Ob63@cluster0.0pg6wpt.mongodb.net/?retryWrites=true&w=majority"

async function connecting(){
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


module.exports= connecting;