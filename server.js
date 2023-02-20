const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
//const db = require('./config/db');

if (process.env.NODE_ENV === 'production') {
    require("dotenv").config({ path: path.join(__dirname, '.env.production') });
} else {
    //require("dotenv").config(); dotenv 모듈 불러오기
    require("dotenv").config({ path: path.join(__dirname, '.env.development') });
}

const port = process.env.PORT; //port 번호
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');

/* cors 오류 해결 */
const cors = require('cors');
app.use(cors({
    origin: true, // 출처 허용 옵션
    credentials: true // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
}));
//app.use(cors());

app.use(express.json()); // 클라이언트에서 application/json 데이터를 보냈을때 파싱해서 body 객체에 넣어줌
app.use(express.urlencoded({ extended: true })); // 클라이언트에서 application/x-www-form-urlencoded 데이터를 보냈을때 파싱해서 body 객체에 넣어줌
app.use(cookieParser({ sameSite: "Lax" }));
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', function(req,res) {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});


app.get('*', function(req,res) {
	res.sendFile(path.join(__dirname, 'client/build/index.html'))
});

app.listen(port, function () {
    console.log(`listening on ${port}`);
});