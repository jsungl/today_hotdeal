const db = require('../../config/db');

module.exports = {
    delRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE Member SET refresh_token=? WHERE user_id=?',[null,userId],(err,data)=>{ //refresh token 삭제
                if(err) reject(err);
                else resolve(true);
            });
        });
    },
    getUserInfo: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Member WHERE user_id=?',[userId],(err,data) => { //유저정보 조회
                if(err) reject(err);
                else resolve(data);
            });
        });
    }
};