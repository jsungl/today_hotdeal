const db = require('../../config/db');

module.exports = {
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
};