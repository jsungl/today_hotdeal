const express = require('express');
const path = require('path');
const app = express();
const db = require('./dbconfig/db');

if (process.env.NODE_ENV === 'production') {
    require("dotenv").config({ path: path.join(__dirname, '.env.production') });
} else {
    //require("dotenv").config(); dotenv 모듈 불러오기
    require("dotenv").config({ path: path.join(__dirname, '.env.development') });
}

const port = process.env.PORT;

app.use(express.json());
const cors = require('cors');
app.use(cors());

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', function(req,res) {
    //res.send('hello node.js server')
    res.sendFile(path.join(__dirname, 'client/build/index.html'))
});

app.get('/test',function(req,res) {
    res.send('전송 성공!')
});

app.get('/api',(req,res) => {
    db.query('select * from testTable',(err,data) => {
        if (err) {
            res.send(err);
        } else{
            res.send(data);
        }
    })
});

app.get('*', function(req,res) {
	res.sendFile(path.join(__dirname, 'client/build/index.html'))
});

app.listen(port, function () {
    console.log(`listening on ${port}`);
});