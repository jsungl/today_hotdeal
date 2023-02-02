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
    getUserInfo: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Member WHERE user_id=?',[userId],(err,data) => { //유저정보 조회
                if(err){
                    reject(err);
                }else {
                    resolve(data);
                }
            });
        });
    }
};