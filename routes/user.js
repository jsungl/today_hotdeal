const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const jwtConfig = require('../config/jwt');
const jwt = require('../modules/user/jwt');
const checkUser = require('../modules/user/checkUser');
const manageUser = require('../modules/user/manageUser');
const getUserPost = require('../modules/post/getPost');
const preventCSRF = require('../modules/preventCSRF'); 
const router = express.Router();

//* 회원가입
router.post('/signUp', async(req, res) => {
    let userId = req.body.userId;
    let userPwd = req.body.password;
    let userNickname = req.body.nickName;
    let userEmail = req.body.email;
    let user = {id:false, nickname:false};

    try{
        const result1 = await checkUser.chkId(userId); //아이디 중복검사
        if(result1.length !== 0){
            return res.status(409).json({ isJoined: false, duplication:"id", message: "이미 사용중인 아이디입니다" });
        }else {
            user.id = true;
        }

        const result2 = await checkUser.chkNickname(userNickname); //닉네임 중복검사
        if(result2.length !== 0){
            return res.status(409).json({ isJoined: false, duplication:"nickname", message: "이미 사용중인 닉네임입니다" });
        }else {
            user.nickname = true;
        }

        if(user.id && user.nickname) { //아이디&닉네임 모두 중복되지 않으면 회원가입 성공
            const hashPwd = await bcrypt.hash(userPwd, 10);
            db.query('INSERT INTO Member(user_id,user_pwd,user_nickname,user_email) VALUES(?,?,?,?)',[userId,hashPwd,userNickname,userEmail],(err,data) => {
                if(err){
                    console.log(err);
                }else {
                    res.status(200).json({isJoined: true});
                }
            });
        }
        
    }catch(err){
        console.log('POST /user/signUp :',err);
    }
});

//* 로그인
router.post('/login',(req, res) => {
    let userId = req.body.userId;
    let userPwd = req.body.password;
    let rememberMe = req.body.rememberMe; //쿠키로 저장
    //console.log('요청확인 :',req);

    try{
        db.query('SELECT * FROM Member WHERE user_id=?',[userId],async(err,data) => {
            if(err){
                console.log(err);
            }else {
                if(data.length !== 0){
                    const match = await bcrypt.compare(userPwd, data[0].user_pwd);
                    if(match){
                        //로그인 성공
                        
                        let { accessToken,refreshToken } = await jwt.sign(data[0]);
                        res.cookie('access_token',accessToken,{ httpOnly:true, sameSite:'Lax' }); //httpOnly :true 때문에 클라이언트(react)에서 접근불가
                        //maxAge: 1000 * 60 * 60
                        res.cookie('refresh_token', refreshToken, { httpOnly:true, sameSite:'Lax' });
                        //maxAge: 1000 * 60 * 60 * 24 * 7

                        let userInfo = {userId:data[0].user_id, userNickname:data[0].user_nickname, isLogined:true};
                        //let userInfo = {userId:data[0].user_id, isLogined:true};
                        
                        if(rememberMe === true) {
                            res.cookie('user',JSON.stringify({userId:data[0].user_id, isLogined:true}),{ httpOnly:true, sameSite:'Lax', maxAge:1000 * 60 * 60 * 24 * 7 });
                            res.cookie('rememberMe',true,{ httpOnly:true, sameSite:'Lax', maxAge:1000 * 60 * 60 * 24 * 7 }); //만료기간 일주일
                        }else {
                            res.cookie('user',JSON.stringify({userId:data[0].user_id, isLogined:true}),{ httpOnly:true, sameSite:'Lax' }); //세션토큰
                        }    

                        //응답
                        return res.status(200).json({isLogined: true, userInfo});
                    }else{
                        //로그인 실패(비밀번호 불일치)
                        return res.status(400).json({isLogined: false, message:'비밀번호가 일치하지 않습니다.'});
                    }
                }else {
                    //로그인 실패(아이디 불일치 or 비회원) 
                    res.status(400).json({isLogined: false, message:'아이디 일치하지 않거나 회원이 아닙니다.'});
                }
            }
        });
    }catch(err){
        console.log('POST /user/login :',err);
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
router.post('/logout',async(req,res) => {
    try {
        let userId = req.body.userId;
        delAllCookies(req,res);
        if(userId){
            const result = await manageUser.delRefreshToken(userId);
            result && res.status(200).json({isLogout: true});
        }
    }catch(err){
        console.log('POST /user/logout :',err);
    }
    
});


//* 토큰 유효성 검사
const authenticateAccessToken = async(req,res,next) => {
    try{
        const _csrf = preventCSRF.chkReferer(req.headers.referer);
        if(!_csrf) return res.status(301).json({ redirectUrl: '/' }); //csrf 방어 - referrer 검증

        let cAccessToken = req.cookies['access_token'];
        let cRefreshToken = req.cookies['refresh_token'];
        //let token = req.headers.authorization.split(' ')[1];

        if (!cAccessToken) {
            res.cookie('refresh_token','',{ maxAge:0 });
            return res.status(401).json({authenticated: false, message:'비정상적인 접근입니다.'});
        }

        const decoded = await jwt.verify(cAccessToken,jwtConfig.accessToken().secretKey);
        const userInfo = JSON.parse(Buffer.from(cAccessToken.split('.')[1], 'base64').toString()); //access token decode
        if(decoded.message === 'jwt expired'){ //access token 만료

            const data = await checkUser.getUserInfo(userInfo.id); //refresh token 조회
            if(!cRefreshToken) {
                res.cookie('access_token','',{ maxAge:0 });
                return res.status(401).json({authenticated: false, userId:userInfo.id, message:'refresh token이 존재하지 않습니다.'});
            }

            if(cRefreshToken === data[0].refresh_token) { //DB에 저장되어있는 refresh token 과 비교
                const myRefreshToken = await jwt.verify(cRefreshToken,jwtConfig.refreshToken().secretKey);
                if(myRefreshToken.message === 'jwt expired'){ //refresh token 만료
                    const result = await manageUser.delRefreshToken(userInfo.id);
                    if(result) { // refresh token 만료
                        delAllCookies(req,res);
                        return res.status(401).json({authenticated: false, userId:userInfo.id, message:'refresh token 만료. 재로그인 필요'});
                    }
                }else {
                    const myNewToken = await jwt.reSignToken({user_id:userInfo.id, user_nickname:userInfo.nickname});
                    res.cookie('access_token',myNewToken,{ httpOnly:true, sameSite:'Lax' });
                    req.decoded = {id:userInfo.id, nickname:userInfo.nickname};
                    next();
                }

            }else { // 유효하지 않는 refresh token
                delAllCookies(req,res);
                return res.status(401).json({authenticated: false, userId:userInfo.id, message:'비정상적인 접근입니다.'});
            }

        }else if(decoded.message === 'invalid token'){ // 유효하지 않는 access token
            delAllCookies(req,res);
            return res.status(401).json({authenticated: false, userId:userInfo.id, message:'비정상적인 접근입니다.'});
        }else { // 정상적인 토큰
            req.decoded = {id:userInfo.id, nickname:userInfo.nickname};
            next();
        }

    }catch(err) {
        console.log('토큰 유효성 검사 에러 :',err);
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
router.get('/checkLogin',async(req,res) => {
    let cUser = req.cookies['user'];
    let cRemember = req.cookies['rememberMe'];

    // console.log('cUser :',cUser,typeof(cUser));
    // console.log('cRememberMe :',cRemember);

    try {
        if(!cUser) { //쿠키없으면 로그아웃
            //쿠키삭제
            delAllCookies(req,res);
            return res.status(200).json({isLogined: false}); //401로 처리하면 클라이언트 catch문에서 처리
        }else {
            let userId = JSON.parse(cUser).userId;
            let isLogined = JSON.parse(cUser).isLogined;
            const result = isLogined && await checkUser.getUserInfo(userId); //아이디로 닉네임 조회
            
            if(cRemember === true) { //로그인 유지
                let { accessToken,refreshToken } = await jwt.sign(data[0]);
                res.cookie('access_token',accessToken,{ httpOnly:true, sameSite:'Lax' });
                res.cookie('refresh_token', refreshToken, { httpOnly:true, sameSite:'Lax' });
            }
            
            //console.log('result :',result);
            if(result.length !== 0){
                const userInfo = {userId:userId, userNickname:result[0].user_nickname};
                return res.status(200).json({isLogined:true, userInfo});
            }else {
                console.log('일치하는 닉네임 없음!');
                //쿠키삭제
                delAllCookies(req,res);
                return res.status(200).json({isLogined: false});
            }
        }

    }catch(err) {
        console.log("GET /user/chkLogin :",err);
        delAllCookies(req,res);
        return res.status(200).json({isLogined: false});
    }
    
});

//* 회원정보 조회
router.get('/getUserInfo',async(req,res) => {
    const _csrf = preventCSRF.chkReferer(req.headers.referer);
    try {
        if(_csrf) {
            let userId = req.query.userId;
            if(!userId) return res.status(400).json({ message: 'UserId is undefined' });
            const data = await checkUser.getUserInfo(userId);
            const post = await getUserPost.allPost(userId);
            if(data.length !== 0){
                let userInfo = {
                    id: data[0].user_id,
                    nickname: data[0].user_nickname,
                    email: data[0].user_email,
                    joinDate: data[0].join_date,
                };
                return res.status(200).json({ success: true, userInfo, post });
            }else {
                return res.status(404).json({ message: 'UserId is not exist' });
            }
        }else {
            res.status(301).json({ redirectUrl: '/' });
        }    
    }catch(err) {
        console.log('GET /user/getUserInfo :',err);

    }

});


//* 회원정보 변경
router.post('/modifyMemberInfo', async(req, res) => {
    let userId = req.body.userId;
    let userNickname = req.body.nickName;
    let userEmail = req.body.email;
    let nicknameChk = false;

    try {
        const _csrf = preventCSRF.chkReferer(req.headers.referer);
        if(_csrf) {
            const result = await checkUser.chkNickname(userNickname); //닉네임 중복검사
            if(result.length !== 0){ //409는 리소스의 현재 상태와 충돌하여 요청을 완료할 수 없을 때 사용한다. 그래서 사용자가 충돌을 해결하고 요청을 다시 제출해야한다.
                return res.status(409).json({ isModified: false, duplication:"nickname", message: "이미 사용중인 닉네임입니다" });
            }else {
                nicknameChk = true;
            }

            if(nicknameChk) {
                db.query('UPDATE Member SET user_nickname=?, user_email=? WHERE user_id=?',[userNickname,userEmail,userId],async(err,data) => {
                    if(err){
                        console.log(err);
                    }else {
                        let { accessToken,refreshToken } = await jwt.sign({ user_id:userId, user_nickname: userNickname });
                        let userInfo = { userId, userNickname };
                        res.cookie('access_token',accessToken,{ httpOnly:true, sameSite:'Lax' });
                        res.cookie('refresh_token', refreshToken, { httpOnly:true, sameSite:'Lax' });
                        
                        res.status(200).json({ isModified: true, userInfo });
                    }
                });
            }
        }else {
            res.status(301).json({ redirectUrl: '/' });
        }
    

    }catch(err) {
        console.log('POST /user/modifyMemberInfo :',err);
    }
});

//* 비밀번호 변경
router.post('/modifyMemberPwd', async(req, res) => {
    let userId = req.body.userId;
    let userPassword = req.body.password; //기존 비밀번호
    let userNewPassword = req.body.newPassword; //새로운 비밀번호

    try {
        const _csrf = preventCSRF.chkReferer(req.headers.referer);
        if(_csrf) {
            const data = await checkUser.getUserInfo(userId); //비밀번호 조회
            if(data.length !== 0){ 
                const match = await bcrypt.compare(userPassword, data[0].user_pwd);
                if(match) {
                    const hashPwd = await bcrypt.hash(userNewPassword, 10); //비밀번호 암호화
                    db.query('UPDATE Member SET user_pwd=? WHERE user_id=?',[hashPwd,userId],(err,data) => {
                        if(err){
                            console.log(err);
                        }else {
                            return res.status(200).json({ isModified: true });
                        }
                    });

                }else {
                    //비밀번호 불일치 
                    return res.status(400).json({ isModified: false, message:'비밀번호가 일치하지 않습니다.' });
                }
            }
        }else {
            res.status(301).json({ redirectUrl: '/' });
        }

    }catch(err) {
        console.log('POST /user/modifyMemberPwd :',err);
    }
});

//* 회원탈퇴
router.post('/leaveMember', async(req, res) => {
    let userId = req.body.userId;
    let userPassword = req.body.password;

    try {
        const _csrf = preventCSRF.chkReferer(req.headers.referer);
        if(_csrf) {
            const data = await checkUser.getUserInfo(userId); //비밀번호 조회
            if(data.length !== 0){ 
                const match = await bcrypt.compare(userPassword, data[0].user_pwd);
                if(match) {
                    db.query('DELETE FROM Member WHERE user_id=?',[userId],(err,data) => {
                        if(err){
                            console.log(err);
                        }else {
                            delAllCookies(req,res); //쿠키삭제
                            return res.status(200).json({ result: true });
                        }
                    });

                }else {
                    //비밀번호 불일치 
                    return res.status(400).json({ result: false, message:'비밀번호가 일치하지 않습니다.' });
                }
            }
        }else {
            res.status(301).json({ redirectUrl: '/' });
        }
    }catch(err) {
        console.log('POST /user/leaveMember :',err);
    }
});


 
module.exports = router;