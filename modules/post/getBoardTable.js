const db = require('../../config/db');

module.exports = {
    allByuserId: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT board_no, title, category, hits, up, enroll_date FROM Board WHERE user_id=?',[userId],(err,data)=>{ //유저의 모든 게시물 조회
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    },
    titleByPostId: (postId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT title FROM Board WHERE board_no=?',[postId],(err,data)=>{ //게시물 번호로 제목조회
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    }
};