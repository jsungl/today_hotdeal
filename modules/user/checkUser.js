const db = require('../../config/db');

module.exports = {
    chkId: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT user_id FROM Member WHERE user_id=?',[userId],(err,data)=>{ // 아이디 중복검사
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
            db.query('SELECT user_nickname FROM Member WHERE user_nickname=?',[userNickname],(err,data)=>{ // 닉네임 중복검사
                if(err){
                    reject(err);
                }else {
                    resolve(data);
                }
            });
        });
    },
    getUserById: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Member WHERE user_id=?',[userId],(err,data) => { //아이디로 유저정보 조회
                if(err){
                    reject(err);
                }else {
                    resolve(data);
                }
            });
        });
    },
    getUserByEmail: (userMail) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Member WHERE user_email=?',[userMail],(err,data) => { //이메일로 유저정보 조회
                if(err){
                    reject(err);
                }else {
                    resolve(data);
                }
            });
        });
    }
};