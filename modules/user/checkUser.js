const db = require('../../config/db');

module.exports = {
    chkId: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT user_id FROM Member WHERE user_id=?',[userId],(err,data)=>{
                if(err){
                    reject(err);
                }else {
                    resolve(data);
                }
            });
        });
    },
    chkNickname: (userNickname) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT user_nickname FROM Member WHERE user_nickname=?',[userNickname],(err,data)=>{
                if(err){
                    reject(err);
                }else {
                    resolve(data);
                }
            });
        });
    },
    chkRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT refresh_token FROM Member WHERE user_id=?',[userId],(err,data)=>{
                if(err){
                    reject(err);
                }else {
                    resolve(data);
                }
            });
        });
    },
    chkLogin: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT user_nickname FROM Member WHERE user_id=?',[userId],(err,data)=>{
                if(err){
                    reject(err);
                }else {
                    resolve(data);
                }
            });
        });
    }
};