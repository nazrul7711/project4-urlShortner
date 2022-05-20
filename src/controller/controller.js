const model = require("../model/model");
//const shortid = require("shortid");
const redis = require("redis");
const { promisify } = require("util");
const baseUrl = "http://localhost:3000";

//Connection with Redis 
const redisClient = redis.createClient(
  14831,
  "redis-14831.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("MJQ0Nai8YxU1Ysr4Xdhkp0sl2j9X2YVL", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient); //SET key
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient); //GET key

// Generating random string
function makeid(length) {
  let result = "";
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789-_";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength)); //Math.floor() function returns the largest integer less than or equal to a given number.
  }
  return result;
}

//POST API
const urlShortner = async function (req, res) {
  const { longUrl } = req.body;

// long url validation
  if (!longUrl || !longUrl.trim()) {
    return res
      .status(400)
      .send({ status: false, msg: "Please Enter the Url." });
  }

  let reg =
    /^(https:\/\/www\.|http:\/\/www\.|www\.|https:\/\/|http:\/\/)[^www.,-_][a-zA-Z0-9\-_.$]+\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)$/gm;
  let regex = reg.test(longUrl);

  if (regex === false) {
    return res
      .status(400)
      .send({ status: false, msg: "Please Enter a valid URL." });
  }

  //taking from cache memory
  let cachedData = await GET_ASYNC(`${longUrl}`);
  
  cachedData = JSON.parse(cachedData);

  if (cachedData) {
    return res.status(200).send({ status: true, data: cachedData }); //response from cache
  } 
  else {
    let url = await model.findOne({ longUrl });
    if (url) {
      return res.status(200).send({ status: true, data: url }); // response of same url from db
    } 
    else {
        let urlCode = req.body.urlCode //user is providing URLCode
      if (urlCode) {
          if(!(/^([a-z0-9\-_]{8}$)/).test(urlCode)){
            return res
            .status(400)
            .send({ status: false, msg: "Please enter the correct format --- Its length should be 8 characters and Use only alphabets, digits, - and _" });
          }
        let urlCodee = await model.findOne({ urlCode: urlCode }); //urlcode is unique
        if (urlCodee) {
          return res
            .status(400)
            .send({ status: false, msg: "This Url code is not available" });
        } 
        else {
            //urlcode is available
            const shortUrl = baseUrl + "/" + urlCode

          url = await model.create({ longUrl, shortUrl, urlCode });
          
          await SET_ASYNC(`${longUrl}`, JSON.stringify(url));
          return res.status(200).send({ status: true, data: url });
        }
      }else{
          // no urlcode receieved from re body
      //const urlCode = shortid.generate().toLowerCase();
      const urlCode = makeid(8);
      const shortUrl = baseUrl + "/" + urlCode;
      url = await model.create({ longUrl, shortUrl, urlCode });
      await SET_ASYNC(`${longUrl}`, JSON.stringify(url));
      return res.status(200).send({ status: true, data: url });
    }}
  }
};

//GET API
const getUrl = async function (req, res) {
  let code = req.params.urlCode;
  const urlObject = await model.findOne({ urlCode: code });
  if(!urlObject){
      res.status(400).send({status: false, message: "Wrong URL"})
  }

  let cachedProfileData = await GET_ASYNC(`${urlObject.longUrl}`);
 
  cachedData = JSON.parse(cachedProfileData);
 
  if (cachedData) {
    res.status(302).redirect(cachedData.longUrl);
  } else {
    //await SET_ASYNC(`${code}`, JSON.stringify(urlObject));

    res.status(302).redirect(urlObject.longUrl);
  }
};

module.exports = { urlShortner, getUrl };
