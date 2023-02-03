const db = require('../../config/db');

module.exports = {
    allByPostId: (postId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Image WHERE board_no=?',[postId],(err,data) => { //게시물 번호로 해당 이미지 테이블 조회
                if(err) {
                    reject(err); 
                }else {
                    resolve(data);
                }
            });
        });
    },
};