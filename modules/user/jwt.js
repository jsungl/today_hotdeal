const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/jwt');
const db = require('../../config/db');

module.exports = {
    sign: (user) => { //토큰 발급(로그인,access token, refresh token)
        const payload = {
            id: user.user_id,
            nickname: user.user_nickname
        };

        const result = {
            accessToken: jwt.sign(payload, jwtConfig.accessToken().secretKey, jwtConfig.accessToken().options),
            refreshToken: jwt.sign(payload, jwtConfig.refreshToken().secretKey, jwtConfig.refreshToken().options),
        };
        
        return new Promise((resolve, reject) => {
            db.query('UPDATE Member SET refresh_token=? WHERE user_id=?',[result.refreshToken,user.user_id],(err,data)=>{
                if(err){
                    reject(err);
                }else {
                    resolve(result);
                }
            });
        });
    },
    verify: (token,secretKey) => { //토큰 검증
        let decoded = null;
        try {
            decoded = jwt.verify(token, secretKey);
            return decoded;
        } catch (err) {
            return err; //user.js에서 에러처리

            // if(err.message === 'jwt expired') {
            //     console.log('유효기간이 완료된 토큰 입니다.');
            //     const err = new Error('TokenExpiredError');
            //     throw err;
            // } else if(err.message === 'invalid token') {
            //     console.log('유효하지 않은 토큰입니다.');
            // } else {
            //     console.log('유효하지 않은 토큰입니다.');
            // }
        }
    },
    reSignToken: (user) => { //토큰 재발급(access token)
        const payload = {
            id: user.user_id,
            nickname: user.user_nickname
        };
        const accessToken = 
            jwt.sign(payload, jwtConfig.accessToken().secretKey, jwtConfig.accessToken().options);

        return accessToken;
    } 
}