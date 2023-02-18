const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/db');
const jwtConfig = require('../config/jwt');
const jwt = require('../modules/user/jwt');
const checkUser = require('../modules/user/checkUser');
const manageToken = require('../modules/user/manageToken');
const sqlToBoardTable = require('../modules/post/sqlToBoardTable');
const { chkReferer, nodeMailer } = require('../modules/util');
const router = express.Router();

//* Referrer 검사
const checkReferrer = (req,res,next) => {
    const _csrf = chkReferer(req.headers.referer);
    if(_csrf) {
        next();
    }else {
        console.log('Referrer 검사 통과 실패');
        return res.status(301).json({ redirectUrl: '/', message: 'referrer invalid' });
    }

}

//* 회원가입
router.post('/signUp', checkReferrer, async(req, res) => {
    try{
        let userId = req.body.userId;
        let userPwd = req.body.password;
        let userNickname = req.body.nickName;
        let userEmail = req.body.email;
        let user = {id:false, nickname:false, email:false};

        const result1 = await checkUser.chkId(userId); //아이디 중복검사
        if(result1.length !== 0){
            return res.status(409).json({ duplication:"id", message: "이미 사용중인 아이디입니다" });
        }else {
            user.id = true;
        }

        const result2 = await checkUser.chkNickname(userNickname); //닉네임 중복검사
        if(result2.length !== 0){
            return res.status(409).json({ duplication:"nickname", message: "이미 사용중인 닉네임입니다" });
        }else {
            user.nickname = true;
        }

        const result3 = await checkUser.chkEmail(userEmail); //이메일 중복검사
        if(result3.length !== 0){
            return res.status(409).json({ duplication: "email", message: "이미 가입되어있는 이메일입니다" });
        }else {
            user.email = true;
        }


        if(user.id && user.nickname && user.email) { //아이디&닉네임&이메일 모두 중복되지 않으면 회원가입 성공
            const hashPwd = await bcrypt.hash(userPwd, 10);
            db.query('INSERT INTO Member(user_id,user_pwd,user_nickname,user_email) VALUES(?,?,?,?)',[userId,hashPwd,userNickname,userEmail],(err,data) => {
                if(!err){
                    return res.status(200).json({isJoined: true});
                }
            });
        }
        
    }catch(err) {
        console.log('POST /user/signUp :',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 로그인
router.post('/login', checkReferrer, (req, res) => {    
    try{
        let userId = req.body.userId;
        let userPwd = req.body.password;
        let rememberMe = req.body.rememberMe;

        db.query('SELECT * FROM Member WHERE user_id=?',[userId],async(err,data) => {
            if(err){
                return res.status(500).json({ message: err.code });
            }else {
                if(data.length !== 0){
                    const match = await bcrypt.compare(userPwd, data[0].user_pwd);
                    if(match){ //로그인 성공
                        let { accessToken,refreshToken } = await jwt.sign(data[0]);
                        res.cookie('access_token',accessToken,{ httpOnly:true, sameSite:'Lax', maxAge: 1000 * 60 * 60 }); //httpOnly :true 때문에 클라이언트(react)에서 접근불가
                        //maxAge: 1000 * 60 * 60
                        res.cookie('refresh_token', refreshToken, { httpOnly:true, sameSite:'Lax', maxAge: 1000 * 60 * 60 * 24 * 7 });
                        //maxAge: 1000 * 60 * 60 * 24 * 7

                        let userInfo = {userId:data[0].user_id, userNickname:data[0].user_nickname, isLogined:true};
                        //let userInfo = {userId:data[0].user_id, isLogined:true};
                        
                        if(rememberMe === true) {
                            res.cookie('user',JSON.stringify({userId:data[0].user_id, isLogined:true}),{ httpOnly:true, sameSite:'Lax', maxAge:1000 * 60 * 60 * 24 * 7 });
                            res.cookie('rememberMe',true,{ httpOnly:true, sameSite:'Lax', maxAge:1000 * 60 * 60 * 24 * 7 }); //만료기간 일주일
                        }else {
                            res.cookie('user',JSON.stringify({userId:data[0].user_id, isLogined:true}),{ httpOnly:true, sameSite:'Lax' }); //세션토큰
                        }    

                        return res.status(200).json({isLogined: true, userInfo});
                   
                    }else { //로그인 실패(비밀번호 불일치)
                        return res.status(400).json({ message: '비밀번호가 일치하지 않습니다' });
                    }

                }else { //로그인 실패(아이디 불일치 or 비회원) 
                    return res.status(400).json({ message: '아이디가 일치하지 않거나 가입된 회원이 아닙니다' });
                }
            }
        });
    }catch(err){
        console.log('POST /user/login :',err);
        return res.status(500);
    }
});

//* 쿠키 모두 삭제(로그아웃 처리하는 상황 발생시)
const delAllCookies = (req,res) => { 
    let cAccessToken = req.cookies['access_token'];
    cAccessToken && res.cookie('access_token','',{ maxAge:0 });
    let cRefreshToken = req.cookies['refresh_token'];
    cRefreshToken && res.cookie('refresh_token','',{ maxAge:0 });
    let cUser = req.cookies['user'];
    cUser && res.cookie('user','',{ maxAge:0 });
    let cRemember = req.cookies['rememberMe'];
    cRemember && res.cookie('rememberMe','',{ maxAge:0 });
}


//* 로그아웃
router.post('/logout', checkReferrer, async(req,res) => {
    try {
        let userId = req.body.userId;
        if(userId){
            delAllCookies(req,res);
            const result = await manageToken.delRefreshToken(userId);
            if(result) return res.status(200).json({ isLogout: true });

        }else {
            return res.status(409).json({ message: 'userId invalid' });
        }

    }catch(err) {
        console.log('POST /user/logout :',err);
        return res.status(500).json({ message: err.code });
    }
});


//* 토큰 유효성 검사
const authenticateAccessToken = async(req,res,next) => {
    try{
        const _csrf = chkReferer(req.headers.referer);
        if(!_csrf) return res.status(301).json({ message: 'referrer invalid' });

        let cAccessToken = req.cookies['access_token'];
        let cRefreshToken = req.cookies['refresh_token'];
        //let token = req.headers.authorization.split(' ')[1];

        if (!cAccessToken) {
            res.cookie('refresh_token','',{ maxAge:0 });
            return res.status(401).json({ message: 'access token is not found' });
        }

        const decoded = await jwt.verify(cAccessToken,jwtConfig.accessToken().secretKey);
        const userInfo = JSON.parse(Buffer.from(cAccessToken.split('.')[1], 'base64').toString()); //access token decode
        if(decoded.message === 'jwt expired'){ //access token 만료
            const data = await checkUser.getUserById(userInfo.id); //refresh token 조회
            if(!cRefreshToken) {
                res.cookie('access_token','',{ maxAge:0 });
                return res.status(401).json({ message: 'refresh token is not found' });
            }

            if(cRefreshToken === data[0].refresh_token) { //DB에 저장되어있는 refresh token 과 비교
                const myRefreshToken = await jwt.verify(cRefreshToken,jwtConfig.refreshToken().secretKey);
                if(myRefreshToken.message === 'jwt expired'){ //refresh token 만료
                    const result = await manageToken.delRefreshToken(userInfo.id);
                    if(result) { // refresh token 만료
                        delAllCookies(req,res);
                        return res.status(401).json({ message: 'refresh token invalid' });
                    }

                }else { //토큰검증 모두 통과
                    const myNewToken = await jwt.reSignToken({user_id:userInfo.id, user_nickname:userInfo.nickname}); //비동기로 처리하지 않아도 되지않나
                    res.cookie('access_token',myNewToken,{ httpOnly:true, sameSite:'Lax' });
                    req.decoded = {id:userInfo.id, nickname:userInfo.nickname};
                    next();
                }

            }else { // 유효하지 않는 refresh token
                delAllCookies(req,res);
                return res.status(401).json({ message: 'refresh token invalid' });
            }

        }else if(decoded.message === 'invalid token'){ // 유효하지 않는 access token
            delAllCookies(req,res);
            return res.status(401).json({ message: 'access token invalid' });
        
        }else { // 정상적인 토큰
            req.decoded = {id:userInfo.id, nickname:userInfo.nickname};
            next();
        }

    }catch(err) {
        console.log('토큰 유효성 검사 에러 :',err);
        return res.status(500).json({ message: err.code });
        // if (err === 'TokenExpiredError') {
        //     return res.status(401).json({
        //         code: 401,
        //         message: '토큰이 만료되었습니다.'
        //     });
        // }
        
        // if (err === 'JsonWebTokenError') {
        //     return res.status(401).json({
        //         code: 401,
        //         message: '유효하지 않은 토큰입니다'
        //     });
        // }
    }
}

//* 인증이 필요한 페이지 접속
router.get('/checkUser',authenticateAccessToken,(req,res) => {
    const { id, nickname } = req.decoded;
    res.status(200).json({authenticated: true, userInfo:{id,nickname}});
});


//* 현재 로그인 상태 확인
router.get('/checkLogin', checkReferrer, async(req,res) => {
    try {
        let cUser = req.cookies['user'];
        let cRemember = req.cookies['rememberMe'];
        let cAccessToken = req.cookies['access_token'];
        let cRefreshToken = req.cookies['refresh_token'];
        // console.log('cUser :',cUser,typeof(cUser));
        // console.log('cRememberMe :',cRemember);

        if(!cUser) { 
            if(cAccessToken && cRefreshToken) { //쿠키없으면 로그아웃
                delAllCookies(req,res);
                return res.status(409).json({ message: 'User cookie is not found' });
            }else { //비로그인
                return res.status(200).json({ isLogined: false });
            }

        }else {
            let userId = JSON.parse(cUser).userId;
            let isLogined = JSON.parse(cUser).isLogined;

            if(!userId) return res.status(409).json({ message: 'userId is not found' });
            const result = isLogined && await checkUser.getUserById(userId); //아이디로 닉네임 조회
            
            if(cRemember === true) { //로그인 유지
                let { accessToken,refreshToken } = await jwt.sign(data[0]);
                res.cookie('access_token',accessToken,{ httpOnly:true, sameSite:'Lax' });
                res.cookie('refresh_token', refreshToken, { httpOnly:true, sameSite:'Lax' });
            }
            
            if(result.length !== 0){
                const userInfo = {userId:userId, userNickname:result[0].user_nickname};
                return res.status(200).json({ isLogined: true, userInfo });
            }
        }

    }catch(err) {
        console.log("GET /user/chkLogin :",err);
        delAllCookies(req,res);
        return res.status(500).json({ message: err.code });
    }
    
});

//* 회원정보 조회
router.get('/getUserInfo',checkReferrer,async(req,res) => {
    try {
        let userId = req.query.userId;
        if(!userId) return res.status(409).json({ message: 'userId invalid' });
        
        const data = await checkUser.getUserById(userId); //유저 정보 조회
        const post = await sqlToBoardTable.getAllByUserId(userId); //유저가 작성한 게시물 조회
        if(data.length !== 0){
            let userInfo = {
                id: data[0].user_id,
                nickname: data[0].user_nickname,
                email: data[0].user_email,
                joinDate: data[0].join_date,
            };
            return res.status(200).json({ success: true, userInfo, post });
        
        }else {
            return res.status(404).json({ message: 'userId not found' });
        }

    }catch(err) {
        console.log('GET /user/getUserInfo :',err);
        return res.status(500).json({ message: err.code });
    }

});


//* 회원정보 변경
router.put('/modifyMemberInfo', checkReferrer, async(req, res) => {
    try {
        let userId = req.body.userId;
        let userNickname = req.body.nickName;
        let userEmail = req.body.email;
        let nicknameChk = false;
        let emailChk = false;
        
        const userInfo = await checkUser.getUserById(userId);

        if(userInfo[0].user_nickname !== userNickname) { //유저가 닉네임 변경
            const result = await checkUser.chkNickname(userNickname); //닉네임 중복검사
            if(result.length !== 0){ //409는 리소스의 현재 상태와 충돌하여 요청을 완료할 수 없을 때 사용한다. 그래서 사용자가 충돌을 해결하고 요청을 다시 제출해야한다.
                return res.status(409).json({ duplication:"nickname", message: "이미 사용중인 닉네임입니다" });
            }else {
                nicknameChk = true;
            }

        }else {
            nicknameChk = true;
        }
        
        
        if(userInfo[0].user_email !== userEmail) { //유저가 이메일 변경
            const result2 = await checkUser.chkEmail(userEmail); //이메일 중복검사
            if(result2.length !== 0) {
                return res.status(409).json({ duplication:"email", message: "이미 가입되어있는 이메일입니다" });
            }else {
                emailChk = true;
            }

        }else {
            emailChk = true;
        }


        if(nicknameChk && emailChk) {
            db.query('UPDATE Member SET user_nickname=?, user_email=? WHERE user_id=?',[userNickname,userEmail,userId], async(err,data) => {
                if(!err){
                    let { accessToken,refreshToken } = await jwt.sign({ user_id:userId, user_nickname: userNickname });
                    let userInfo = { userId, userNickname };
                    res.cookie('access_token',accessToken,{ httpOnly:true, sameSite:'Lax' });
                    res.cookie('refresh_token', refreshToken, { httpOnly:true, sameSite:'Lax' });
                    
                    return res.status(200).json({ isModified: true, userInfo });
                }
            });
        }

    }catch(err) {
        console.log('POST /user/modifyMemberInfo :',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 비밀번호 변경
router.patch('/modifyMemberPwd', checkReferrer, async(req, res) => {
    try {
        let userId = req.body.userId;
        let userPassword = req.body.password; //기존 비밀번호
        let userNewPassword = req.body.newPassword; //새로운 비밀번호

        const data = await checkUser.getUserById(userId); //비밀번호 조회
        if(data.length !== 0){ 
            const match = await bcrypt.compare(userPassword, data[0].user_pwd);
            if(match) {
                const hashPwd = await bcrypt.hash(userNewPassword, 10); //비밀번호 암호화
                db.query('UPDATE Member SET user_pwd=? WHERE user_id=?',[hashPwd,userId],(err,data) => {
                    if(!err){
                        return res.status(200).json({ isModified: true });
                    }
                });

            }else { //비밀번호 불일치
                return res.status(401).json({ message:'비밀번호가 일치하지 않습니다' });
            }
        
        }else {
            return res.status(404).json({ message: 'userId not exist' });
        }

    }catch(err) {
        console.log('POST /user/modifyMemberPwd :',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 회원탈퇴 전 요청검사
router.post('/prevLeaveMember', checkReferrer, async(req,res) => {
    try {
        let userId = req.body.userId;
        let userPassword = req.body.password;

        const data = await checkUser.getUserById(userId); //비밀번호 조회
        if(data.length !== 0){ 
            const match = await bcrypt.compare(userPassword, data[0].user_pwd);
            if(match) {
                return res.status(200).json({ result: true });
            
            }else { //비밀번호 불일치 
                return res.status(401).json({ message:'비밀번호가 일치하지 않습니다.' });
            }

        }else {
            return res.status(404).json({ message: 'userId not exist' });
        }
        
    }catch(err) {
        console.log('POST /user/prevLeaveMember :',err);
        return res.status(500).json({ message: err.code });
    }
})

//* 회원탈퇴
router.delete('/leaveMember', checkReferrer, async(req, res) => {
    try {
        let userId = req.body.userId;
        db.query('DELETE FROM Member WHERE user_id=?',[userId],(err,data) => {
            if(!err){
                delAllCookies(req,res); //쿠키삭제
                return res.status(200).json({ result: true });
            }
        });

    }catch(err) {
        console.log('POST /user/leaveMember :',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 비밀번호 재설정 링크 인증토큰 생성
const createToken = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(20, (err, buf) => {
            if (err) reject(err);
            resolve(buf.toString('base64'));
        });
    });
}

//* 아이디/비밀번호 찾기
router.post('/findAccount', checkReferrer, async(req, res) => {
    try {
        const userMail = req.body.email;
        const data = await checkUser.getUserByEmail(userMail);
        if(data.length !== 0) {
            let token = await createToken();
            console.log(token);
            const createTokenResult = await manageToken.addAuthToken(data[0].user_id,token); //유효기간과 함께 DB에 토큰저장
            if(createTokenResult) {
                let encodedToken = token.replace(/&/g,"%26").replace(/\+/g,"%2B"); //토큰 인코딩
                let resetInfo = {userId: data[0].user_id, token: encodedToken, email: userMail};
                let sendMailResult = nodeMailer(resetInfo);
                if(sendMailResult) {
                    return res.status(200).json({ result: true });
                }
            }

        }else {
            return res.status(404).json({ message:'가입되어있지 않은 메일입니다' });
        }
        
    }catch(err) {
        console.log('POST /user/findAccount ',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 비밀번호 재설정
router.patch('/resetPassword', checkReferrer, async(req, res) => {
    try {
        let userId = req.body.userId;
        let token = req.body.token;
        let password = req.body.password;

        const data = await manageToken.verifyAuthToken(token); //토큰검증
        if(data.length !== 0) {
            const result = await manageToken.delAuthToken(token); //토큰삭제
            const hashPwd = await bcrypt.hash(password, 10); //새 비밀번호 암호화
            if(result) {
                db.query('UPDATE Member SET user_pwd=? WHERE user_id=?',[hashPwd,userId],(err,data) => {
                    if(!err){
                        return res.status(200).json({ result: true });
                    }
                });
            }

        }else { //토큰 검증 실패
            return res.status(401).json({ message:'토큰이 유효하지 않습니다' });
        }

    }catch(err) {
        console.log('POST /user/resetPassword ',err);
        return res.status(500).json({ message: err.code });
    }
});
 
module.exports = router;