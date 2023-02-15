const db = require('../../config/db');

module.exports = {
    getTotalCount: () => { //게시물 총 개수
        return new Promise((resolve, reject) => {
            db.query('SELECT count(*) count FROM Board',(err,data)=>{ 
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    },
    getFirstPage: () => { //1번째 페이지 데이터 조회(10개)
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Board ORDER BY board_no desc limit 10 offset 0',(err,data)=>{ 
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    },
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
    uploadPost: (postInfo,nickname) => {
        const { postTitle,postCat,postUrl,prdctMall,prdctName,prdctPrice,dlvyChrg,userId,textContent,htmlContent } = postInfo;
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO Board(title,html_content,text_content,user_nickname,category,product_url,product_mall,product_name,product_price,delivery_charge,user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [postTitle,htmlContent,textContent,nickname,postCat,postUrl,prdctMall,prdctName,prdctPrice,dlvyChrg,userId],(err,data) => {
                if (err) {
                    reject(err); 
                } else{
                    const postId = data.insertId;
                    resolve(postId);
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
    increaseUp: (postId) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE Board SET up=up+1 WHERE board_no=?',[postId],(err,data) => { //추천
                if(err) {
                    reject(err);  
                }else {
                    resolve(data);
                }
            });
        });
    },
    decreaseUp: (postId) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE Board SET up=up-1 WHERE board_no=?',[postId],(err,data) => { //추천취소
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