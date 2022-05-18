const express = require('express');
const router = express.Router();
const { urlShortner, getUrl }= require('../controller/controller')

router.post("/url/shorten", urlShortner)
router.get("/:urlCode", getUrl)

module.exports = router;