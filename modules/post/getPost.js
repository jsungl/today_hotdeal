const db = require('../../config/db');

module.exports = {
    allPost: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT board_no, title, category, hits, up, enroll_date FROM Board WHERE user_id=?',[userId],(err,data)=>{ //유저의 모든 게시글 조회
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    },
};