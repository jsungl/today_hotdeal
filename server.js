const express = require('express');
const path = require('path');
//const AWS = require('aws-sdk');
const app = express();
const db = require('./dbconfig/db');
const multer = require('multer');
//const multerS3 = require('multer-s3');
const fs = require('fs');

if (process.env.NODE_ENV === 'production') {
    require("dotenv").config({ path: path.join(__dirname, '.env.production') });
} else {
    //require("dotenv").config(); dotenv 모듈 불러오기
    require("dotenv").config({ path: path.join(__dirname, '.env.development') });
}

const port = process.env.PORT;

/* cors 오류 해결 */
app.use(express.json());
const cors = require('cors');
app.use(cors());

//app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', function(req,res) {
    res.send('hello node.js server')
    //res.sendFile(path.join(__dirname, 'client/build/index.html'))
});

//* React 서버와 연결
app.get('/test',function(req,res) {
    res.send('react 연결 확인!')
});

//* 게시글 업로드
app.post('/test',function(req,res) {
    console.log(req.body);
    res.send('ok');
});

/**
 * RDS 연결
 */

//* 게시글 내용 읽어오기
app.get('/getPost',(req,res) => {
    db.query('select * from Board where id=?',[Number(req.query.id)],(err,data) => {
        if (err) {
            res.send(err);
        } else{
            res.send(data);
        }
    })
});

//* 게시글 리스트 읽어오기
app.get('/getPostList',(req,res) => {
    db.query('select * from Board',(err,data) => {
        if (err) {
            res.send(err);
        } else{
            res.send(data);
        }
    })
});

// app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.post('/uploadPost',(req,res) => {
    let title = req.body.title;
    let content = req.body.content;
    let userId = req.body.userId;

    db.query('insert into Board(title,content,userId) values (?,?,?)',[title,content,userId],(err,data) => {
        if (err) {
            //res.send(err);
            console.log('/uploadPost error :: ',err);
            res.status(500).json({uploaded: false, error: {message:'upload fail!'}});
        } else{
            const postId = data.insertId;
            res.status(200).json({uploaded: true, message:'upload success!',postId});
        }
    });

});

app.post('/updateImagePath',(req,res) => {
    console.log(req.body);
    let userId = req.body.userId;
    let postId = req.body.postId;
    db.query('select content from Board where id=?',[postId],(err,data) => {
        if (err) {
            res.status(500).json({ error: {message:err}});
        } else{
            //console.log('content :: ',data[0].content);
            const content = data[0].content;
            const newContent = content.replaceAll(`temp/${userId}`,`posts/${postId}`);
            db.query('update Board set content=? where id=?',[newContent,postId],(err,data) => {
                if(err) {
                    console.log('Image path Update Error :: ',err);
                    res.status(500).json({updated:false, error:{message:'Image path Update Fail!'}});
                } else {
                    res.status(200).json({uploaded: true, message:'Image path Update Success!'});
                }
            });
        }
    })

})

// app.get('*', function(req,res) {
// 	res.sendFile(path.join(__dirname, 'client/build/index.html'))
// });

app.listen(port, function () {
    console.log(`listening on ${port}`);
});