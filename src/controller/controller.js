const model = require('../model/model')
const shortid = require('shortid')
const baseUrl = 'http://localhost:3000'

const urlShortner= async function(req, res){
    const { longUrl } = req.body
    if(!longUrl.trim()){
        return res.status(400).send({ status: false, msg: "Please Enter the Url."})
    }

    let reg = /^(https:\/\/www\.|http:\/\/www\.|www\.|https:\/\/|http:\/\/)[a-zA-Z0-9\-_.$]+\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)$/gm
    let regex= reg.test(longUrl)

    if(regex === false){
        return res.status(400).send({ status: false, msg: "Please Enter a valid URL."})
    }
   
    const urlCode = shortid.generate().toLowerCase()
    let urlCodee = await model.findOne({urlCode})
    if(urlCodee){
        return res.status(400).send({ status: false, msg: "This Url code is not available"})
    }
    
        let url = await model.findOne({longUrl})
        if(url){
            return res.status(200).send({ status: true, data: url })
        }
        else{
            const shortUrl = baseUrl + '/' + urlCode

            url = await model.create({longUrl, shortUrl, urlCode})
            return res.status(200).send({ status: true, data: url })
        }
    }
    

module.exports = { urlShortner }