const express = require('express');
const path = require('path');
const AWS = require('aws-sdk');
const app = express();
const db = require('./dbconfig/db');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');

if (process.env.NODE_ENV === 'production') {
    require("dotenv").config({ path: path.join(__dirname, '.env.production') });
} else {
    //require("dotenv").config(); dotenv 모듈 불러오기
    require("dotenv").config({ path: path.join(__dirname, '.env.development') });
}

const port = process.env.PORT;

//* aws region 및 자격증명 설정
AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
});

/* S3에 있는 버킷 리스트 출력 */
// const s3 = new AWS.S3();
// s3.listBuckets().promise().then((data) => {
//   console.log('S3 : ', JSON.stringify(data, null, 2));
// });
 
/* EC2에 있는 인스턴스 리스트 출력 */
// const ec2 = new AWS.EC2();
// ec2.describeInstanceStatus().promise()
// .then((data) => {
//   console.log('EC2 : ', JSON.stringify(data, null, 2));
// });

/* cors 오류 해결 */
app.use(express.json());
const cors = require('cors');
app.use(cors());

//app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', function(req,res) {
    res.send('hello node.js server')
    //res.sendFile(path.join(__dirname, 'client/build/index.html'))
});

// React 서버와 연결 확인
app.get('/test',function(req,res) {
    res.send('전송 성공!')
});

// RDS 연결 테스트
app.get('/api',(req,res) => {
    db.query('select * from testTable',(err,data) => {
        if (err) {
            res.send(err);
        } else{
            res.send(data);
        }
    })
});

/**
 * 이미지 S3 업로드 테스트
 */

//* AWS S3 multer 설정
const upload = multer({
    //* 저장공간
    // s3에 저장
    storage: multerS3({
       // 저장 위치
       s3: new AWS.S3(),
       bucket: 'js-test-bucket-01',
       acl: "public-read",
       contentType: multerS3.AUTO_CONTENT_TYPE,
       key(req, file, cb) {
          cb(null, `image/${Date.now()}_${path.basename(file.originalname)}`) // image 폴더안에다 파일을 저장
       },
    }),
    //* 용량 제한 5MB
    limits: { fileSize: 5 * 1024 * 1024 },
});

//* 로컬 multer 설정
const upload2 = multer(); // upload2.none() 용으로 사용

//* 싱글 이미지 파일 업로드
app.post('/upload', upload.single('img'), (req, res) => {
    console.log('req.files :: ',req.files);
    console.log('req.file.location :: ',req.file.location);
    console.log('req.body ::', req.body);





    db.query('insert into testTable(content) values(?)',[req.body.title],(err,data) => {
        if (err) {
            res.send(err);
            //res.status(500).json({uploaded: false, error: error});
        } else{
            res.send('ok');
            //res.status(200).json({uploaded: true, url: req.file.location});
            //res.json({ url: req.file.location });

        }
    })
});

//* 게시글 업로드
// app.post('/upload', upload2.none(), async (req, res, next) => {
//     console.log(req.body.title);
//     db.query('insert into testTable(content) values(?)',[req.body.title],(err,data) => {
//         if (err) {
//             res.send(err);
//         } else{
//             res.send(data);
//         }
//     })
//     res.send('ok');
// });

// app.get('*', function(req,res) {
// 	res.sendFile(path.join(__dirname, 'client/build/index.html'))
// });

app.listen(port, function () {
    console.log(`listening on ${port}`);
});