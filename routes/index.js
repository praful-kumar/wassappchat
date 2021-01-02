var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/chat', (req, res)=>{
  res.render('chat')
})

module.exports = router;
