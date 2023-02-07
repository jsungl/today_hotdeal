const db = require('../../config/db');

module.exports = {
    getAllByPostId: (postId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Image WHERE board_no=?',[postId],(err,data) => { //게시물 번호로 해당 게시물 이미지 전체 조회
                if(err) {
                    reject(err); 
                }else {
                    resolve(data);
                }
            });
        });
    },
    getFileNameByPostId: (postId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT file_name FROM Image WHERE board_no=?',[postId],(err,data) => { //게시물 번호로 해당 게시물 이미지 파일이름 조회
                if(err) {
                    reject(err); 
                }else {
                    resolve(data);
                }
            });
        });

    },
    addImageName: (postId,title,uploadImgNames) => {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO Image(board_no,title,file_name) VALUES(?,?,?)',[postId,title,uploadImgNames],(err,data) => { //게시물 이미지 업로드
                if(err) {
                    reject(err);  
                }else {
                    resolve(true);
                }
            });
        });
    },
};