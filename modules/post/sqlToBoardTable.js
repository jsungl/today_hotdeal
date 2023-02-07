const db = require('../../config/db');

module.exports = {
    getAllByUserId: (userId) => { //유저의 모든 게시물 조회
        return new Promise((resolve, reject) => {
            db.query('SELECT board_no, title, category, hits, up, enroll_date FROM Board WHERE user_id=?',[userId],(err,data)=>{ 
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    },
    getTitleByPostId: (postId) => { //게시물 번호로 제목조회
        return new Promise((resolve, reject) => {
            db.query('SELECT title FROM Board WHERE board_no=?',[postId],(err,data)=>{ 
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    },
    getAllByPostIdOnLogin : (postId,userId) => { //게시물 상세보기(로그인) + 추천확인
        let subSQL = 'SELECT count(*) FROM Up WHERE user_id=? AND board_no=?';
        return new Promise((resolve, reject) => {
            db.query('SELECT *,(' + subSQL +') AS up_chk FROM Board WHERE board_no = ?',[userId,postId,postId],(err, data) => {
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });

    },
    getAllByPostId: (postId) => { //게시물 상세보기(비로그인)
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Board WHERE board_no=?',[postId],(err,data)=>{ 
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    },
    increaseView: (postId) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE Board SET hits=hits+1 WHERE board_no=?',[postId],(err,data) => { //조회수 증가
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    },
    updateHtmlContent: (content, postId) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE Board SET html_content=? WHERE board_no=?',[content,postId],(err,data) => { //이미지 파일 경로 수정(임시폴더->영구폴더)
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    }
};