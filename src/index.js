const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const route = require('./route/route')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect("mongodb+srv://Swetarun:lBf6gTedHw2tfPtQ@cluster0.ebg8a.mongodb.net/group56Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch( err => console.log(err))

app.use('/', route)

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});