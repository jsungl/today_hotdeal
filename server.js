const express = require('express');
const path = require('path');
const app = express();

if (process.env.NODE_ENV === 'production') {
    require("dotenv").config({ path: path.join(__dirname, '.env.prod') });
} else {
    //require("dotenv").config(); dotenv 모듈 불러오기
    require("dotenv").config({ path: path.join(__dirname, '.env.develop') });
}

const port = process.env.PORT;

app.use(express.json());
const cors = require('cors');
app.use(cors());

app.get('/', function(req,res) {
    res.send('hello node.js server')
});

app.get('/test',function(req,res) {
    res.send('전송 성공!')
});

app.listen(port, function () {
    console.log(`listening on ${port}`);
});