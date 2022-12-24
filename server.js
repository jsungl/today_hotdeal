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
    // let title = req.body.title;
    // let content = req.body.body;
    // let imgUrl = null;
    // db.query('insert into Board(title,content,imageURL) values (?,?,?)',[title,content,imgUrl],(err,data) => {
    //     if (err) {
    //         res.status(500).json({uploaded: 'upload fail', error: error});
    //     } else{
    //         res.status(200).json({uploaded: 'upload success'});
    //     }
    // });
});

/**
 * RDS 연결
 */

//* 게시글 내용 읽어오기
app.get('/post',(req,res) => {
    db.query('select * from Board where id=?',[Number(req.query.id)],(err,data) => {
        if (err) {
            res.send(err);
        } else{
            res.send(data);
        }
    })
});

//* 게시글 리스트 읽어오기
app.get('/postList',(req,res) => {
    db.query('select * from Board',(err,data) => {
        if (err) {
            res.send(err);
        } else{
            res.send(data);
        }
    })
});


/**
 * 이미지 로컬 서버 업로드 테스트
 */
try {
	fs.readdirSync('uploads'); // 폴더 확인
} catch(err) {
	console.error('uploads 폴더가 없습니다. 폴더를 생성합니다.');
    fs.mkdirSync('uploads'); // 폴더 생성
}

const uploadImg = multer({
    storage: multer.diskStorage({ // 저장한공간 정보 : 하드디스크에 저장
        destination(req, file, done) { // 저장 위치
            done(null, 'uploads/'); // uploads라는 폴더 안에 저장
        },
        filename(req, file, done) { // 파일명을 어떤 이름으로 올릴지
            const ext = path.extname(file.originalname); // 파일의 확장자
            done(null, path.basename(file.originalname, ext) + Date.now() + ext); // 파일이름 + 날짜 + 확장자 이름으로 저장
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5메가로 용량 제한
});


app.post('/uploadimg',uploadImg.single('file'),(req,res) => {
    res.status(200).json(req.file);
});

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

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
            res.status(200).json({uploaded: true, message:'upload success!'});
        }
    });

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
    console.log('req.file :: ',req.file);
    console.log('req.file.location :: ',req.file.location);
    console.log('req.body ::', req.body);

    db.query('insert into testTable(content) values(?)',[req.body.title],(err,data) => {
        if (err) {
            res.send(err);
            //res.status(500).json({uploaded: false, error: error});
        } else{
            //res.send('ok');
            console.log('data :: ',data);
            res.status(200).json({uploaded: true, url: req.file.location});
            //res.json({ url: req.file.location });
        }
    });
});


//* 컴포넌트 언마운트시 임시폴더 안의 사용자ID 폴더 삭제
app.delete('/uploadimg/:userId',(req,res) => {
    const path = `./uploads/temp/${req.params.userId}`;
    try {
        if(fs.existsSync(path)) {
            fs.rmSync(path,{recursive:true});
            console.log('디렉토리 삭제');
            res.status(200).json('delete directory success!') 
        }else {
            res.status(200).json('temp folder not exist');
        }
    } catch(err) {
        console.log(err);
        res.status(500).json(err);
    }

});

// app.get('*', function(req,res) {
// 	res.sendFile(path.join(__dirname, 'client/build/index.html'))
// });

app.listen(port, function () {
    console.log(`listening on ${port}`);
});