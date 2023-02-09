const db = require('../../config/db');

module.exports = {
    delRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE Member SET refresh_token=? WHERE user_id=?',[null,userId],(err,data)=>{ //refresh token 삭제(null)
                if(err) reject(err);
                else resolve(true);
            });
        });
    },
    addAuthToken: (userId,token) => {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO Auth(user_id,auth_token,expire_date) VALUES(?,?,DATE_ADD(NOW(), INTERVAL 5 MINUTE))',[userId,token],(err,data)=>{
                if(err) reject(err);
                else resolve(true);
            });
        });
    },
    verifyAuthToken: (token) => {
        console.log(token);
        let subSQL = '(SELECT expire_date FROM Auth WHERE auth_token = ?)';
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Auth WHERE NOW() < ' + subSQL,[token],(err,data)=>{
                if(err) reject(err);
                else resolve(data);
            });
        });
    },
    delAuthToken: (token) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM Auth WHERE auth_token=?',[token],(err,data)=>{
                if(err) reject(err);
                else resolve(true);
            });
        });
    }
};