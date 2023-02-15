const express = require('express');
const db = require('../config/db');
const sqlToBoardTable = require('../modules/post/sqlToBoardTable');
const sqlToImageTable = require('../modules/post/sqlToImageTable');
const checkUser = require('../modules/user/checkUser');
const { chkReferer } = require('../modules/util');
const router = express.Router();

//* Referrer 검사
const checkReferrer = (req,res,next) => {
    const _csrf = chkReferer(req.headers.referer);
    if(_csrf) {
        next();
    }else {
        console.log('Referrer 검사 통과 실패!');
        return res.status(301).json({ redirectUrl: '/', message: 'referrer invalid' });
    }

}

//* 데이터 총 개수, 1번째 페이지(0~10) 데이터 조회 -> Home 컴포넌트
router.get('/getHomeList', async(req, res) => {
    // 쿼리 2개 요청시 첫번째 쿼리 끝에 세미콜론을 붙여야한다
    // const sql1 = 'SELECT count(*) count FROM Board;';
    // const sql2 = 'SELECT * FROM Board ORDER BY board_no desc limit 10 offset 0';
    // db.query(sql1+sql2,(err, data) => {
    //     if(!err){
    //         res.send(data);
    //     } else {
    //         res.send(err);
    //     }
    // });

    try {
        const count = await sqlToBoardTable.getTotalCount();
        const data = await sqlToBoardTable.getFirstPage();
        return res.status(200).json({ result: true, totalCount: count[0].count, list: data});

    }catch(err) {
        console.log('GET /post/getHomeList ',err);
        return res.status(500).json({ message: err.code });
    }

});


//* 게시물 목록 조회(정렬방법, 검색방법, 페이징) 
router.get('/getBoardList',(req, res) => {
    let limit = Number(req.query.limit);
    let offset = Number(req.query.offset);
    let category = Number(req.query.category);
    let target = req.query.target;
    let mainSQL = '';
    let subSQL = 'SELECT count(*) FROM Board';
    // let testSubSQL = 'SELECT count(*) FROM Board';
    // let testSQL = '';
    const keyword = '%' + req.query.keyword + '%';


    if(target === 'title_content') {
        if(category > 0) {
            subSQL += ` WHERE (title like ${db.escape(keyword)} OR text_content like ${db.escape(keyword)}) AND category=${category}`;
            mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE (title like ${db.escape(keyword)} OR text_content like ${db.escape(keyword)}) AND category=${category}`;
            // mainSQL = `SELECT * FROM Board WHERE (title like ${db.escape(keyword)} OR text_content like ${db.escape(keyword)}) AND category=${category}`;
        }else {
            subSQL += ` WHERE title like ${db.escape(keyword)} OR text_content like ${db.escape(keyword)}`;
            mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE title like ${db.escape(keyword)} OR text_content like ${db.escape(keyword)}`;
            // mainSQL = `SELECT * FROM Board WHERE title like ${db.escape(keyword)} OR text_content like ${db.escape(keyword)}`;
        }
    }else {
        if(category > 0) {
            subSQL += ` WHERE ${target} like ${db.escape(keyword)} AND category=${category}`;
            mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE (${target} like ${db.escape(keyword)}) AND category=${category}`;
            // mainSQL = `SELECT * FROM Board WHERE (${target} like ${db.escape(keyword)}) AND category=${category}`;
        }else {
            subSQL += ` WHERE ${target} like ${db.escape(keyword)}`;
            mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE ${target} like ${db.escape(keyword)}`;
            // mainSQL = `SELECT * FROM Board WHERE ${target} like ${db.escape(keyword)}`;
        }
    }

    // switch (req.query.target) {
    //   case 'title':
    //       //제목
    //       subSQL += ` WHERE title like ${db.escape(keyword)}`;    
    //       mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE title like ${db.escape(keyword)}`;
    //       break;
    //   case 'content':
    //       //내용
    //       subSQL += ` WHERE text_content like ${db.escape(keyword)}`;
    //       mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE text_content like ${db.escape(keyword)}`;
    //       break;
    //   case 'writer':
    //       //글쓴이     
    //       subSQL += ` WHERE user_id like ${db.escape(keyword)}`;
    //       mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE user_nickname like ${db.escape(keyword)}`;
    //       break;
    //   default:
    //       //제목+내용
    //       subSQL += ` WHERE title like ${db.escape(keyword)} OR text_content like ${db.escape(keyword)}`;
    //       mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE title like ${db.escape(keyword)} OR text_content like ${db.escape(keyword)}`;
    //       break;
    // }
  
    switch(req.query.align) {
      case 'hits':
          //조회수
          mainSQL += ' ORDER BY hits desc,board_no desc limit ? offset ?';
          break;
      case 'up':
          //추천순
          mainSQL += ' ORDER BY up desc,board_no desc limit ? offset ?';
          break;
      case 'enroll_date':
          //오래된순
          mainSQL += ' ORDER BY board_no limit ? offset ?';
          break;
      default:
          //최신순
          mainSQL += ' ORDER BY board_no desc limit ? offset ?';
          break;
    }
  
    db.query(mainSQL,[limit,offset],(err, data) => {
        if(!err){
            res.send(data);
        } else {
            res.send(err);
        }
    });
});

//* client ip를 가져오는 함수
function getUserIP(req) {
    const addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    return addr
}

//* 게시물 정보 조회(상세보기)
router.get('/getBoardContent',async(req, res) => {
    try {
        let postId = req.query.postId;
        let userId = req.query.userId;
        //let userInfo = req.cookies['user'];
        //console.log('userInfo: ',userInfo);
        let myIp = getUserIP(req);

        if(req.cookies[myIp] === undefined){
            //res.cookie('postId',postId,{ sameSite: 'none', secure: true});
            res.cookie(myIp,postId,{
                // 유효시간 1일    
                maxAge: 1000 * 60 * 60 * 24
            });
            await sqlToBoardTable.increaseView(postId);
        }else{
            if(!req.cookies[myIp].includes(postId)) {
                let oldValue = req.cookies[myIp];
                let newValue = oldValue + '_' + postId;
                res.cookie(myIp,newValue,{
                    maxAge: 1000 * 60 * 60 * 24
                });
                await sqlToBoardTable.increaseView(postId);
            }
        }
        
        if(userId) { //로그인
            let data = await sqlToBoardTable.getAllByPostIdOnLogin(postId,userId);
            if(data.length === 0) {
                return res.status(404).json({ message: '게시물이 존재하지 않습니다' }); //410도 맞을것같다
            }else {
                return res.send(data);
            }

        }else { //비로그인
            let data = await sqlToBoardTable.getAllByPostId(postId);
            if(data.length === 0) {
                return res.status(404).json({ message: '게시물이 존재하지 않습니다' }); //410도 맞을것같다
            }else {
                return res.send(data);
            }
        }

    }catch(err) {
        console.log('GET /post/getBoardContent ',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 게시물 등록
router.post('/uploadPost', checkReferrer, async(req,res) => {
    try {
        const { userId } = req.body;
        const data = await checkUser.getUserById(userId);
        const nickname = data[0].user_nickname;
    
        const postId = await sqlToBoardTable.uploadPost(req.body,nickname)
        if(postId) {
            return res.status(200).json({uploaded: true, message:'Upload Success!', postId});
        }

    }catch(err) {
        console.log('POST /post/uploadPost ',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 게시물 등록 - 이미지 경로 변경(임시폴더->영구폴더)
router.post('/updateImagePath',async(req,res) => {
    try {
        let userId = req.body.userId;
        let postId = req.body.postId;
        let uploadImgNames = req.body.data;
    
        const data = await sqlToBoardTable.getAllByPostId(postId);
        if(data !== 0) {
            const content = data[0].html_content;
            const title = data[0].title;
            const newContent = content.replaceAll(`temp/${userId}`,`posts/${userId}/${postId}`);
            await sqlToBoardTable.updateHtmlContent(newContent,postId);

            if(uploadImgNames){ //업로드한 이미지가 있는 경우
                let success = await sqlToImageTable.addImageName(postId,title,uploadImgNames); //Image 테이블에 추가
                if(success) return res.status(200).json({ updated: true });
            
            }else {
                return res.status(200).json({ updated: true });
            }

        }else {
            return res.status(404).json({ message:'post is not found' });
        }

    }catch(err) {
        console.log('POST /post/updateImagePath ',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 게시물 수정
router.put('/updatePost', checkReferrer, (req,res) => {
    // let title = req.body.postTitle;
    // let name = req.body.productName;
    // let price = req.body.productPrice;
    // let dc = req.body.deliveryCharge;
    // let postId = req.body.postId;
    // let textContent = req.body.textContent;
    // let htmlContent = req.body.htmlContent;

    const { postTitle,prdctName,prdctPrice,dlvyChrg,textContent,htmlContent,postId } = req.body;

    db.query('UPDATE Board SET title=?, html_content=?, text_content=?, product_name=?, product_price=?, delivery_charge=? WHERE board_no=?',
        [postTitle,htmlContent,textContent,prdctName,prdctPrice,dlvyChrg,postId],(err,data) => {
            if (err) {
                console.log('PUT /post/updatePost ',err);
                return res.status(500).json({ message: err.code });

            }else {
                return res.status(200).json({ updated: true });
            }
        }
    );
});

//* 게시물 정보와 이미지 파일 조회(게시글 수정시)
router.get('/getBoardInfo', checkReferrer, async(req, res) => {
    try {
        let postId = req.query.postId;
        let data = await sqlToBoardTable.getAllByPostId(postId);
        //const boardInfo = data;
        let data2 = await sqlToImageTable.getFileNameByPostId(postId);
        return res.status(200).json({ boardInfo: data, imageNames: data2[0] === undefined ? null : data2[0].file_name });

    }catch(err) {
        console.log('GET /post/getBoardInfo ',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 게시물 이미지 파일 이름 수정
router.put('/updateImageNames',async(req,res) => {
    try {
        const postId = req.body.postId;
        const updatedImgNames = req.body.files;
        console.log('새롭게 업데이트할 이미지 목록(문자열) :',updatedImgNames);

        const data = await sqlToImageTable.getAllByPostId(postId);
        if(data[0] === undefined){ //기존에 저장된 이미지가 없었던 게시물인 경우 -> 새롭게 추가
            console.log('Image 테이블에 저장된 이미지가 없었음');
            let result = await sqlToBoardTable.getTitleByPostId(postId);
            let result2 = await sqlToImageTable.addImageName(postId,result[0].title,updatedImgNames);
            if(result2) {
                return res.status(200).json({updated: true, message:'Upload Image Table Success!'});
            }

        }else { //이미 기존에 저장된 이미지가 있었던 게시물인 경우 -> 새롭게 변경
            console.log('Image 테이블에 저장된 이미지가 있었음');
            let result = await sqlToImageTable.updateImageName(updatedImgNames,postId);
            if(result) {
                return res.status(200).json({updated: true, message:'Update Image Table Success!'});
            }
        }

    }catch(err) {
        console.log('PUT /post/updateImageNames ',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 게시물 추천
router.post('/increaseUp',checkReferrer, async(req,res) => {
    try {
        let userId = req.body.userId;
        let postId = req.body.postId;
        
        if(userId && postId) {
            let result = await sqlToBoardTable.increaseUp(postId);
            if(result) {
                db.query('INSERT INTO Up(user_id,board_no) VALUES(?,?)',[userId,postId],(err,data) => {
                    if(err){
                        console.log('POST /post/increaseUp ',err);
                        return res.status(500).json({message: err.code});
                    }else{
                        return res.status(200).json({result: true, message:'추천하였습니다'});
                    }
                });
            }
        }else {
            res.status(400).json({message: 'userId invalid or postId invalid'});
        }


    }catch(err) {
        console.log('POST /post/increaseUp ',err);
        return res.status(500).json({ message: err.code });
    }
    
});

//* 게시물 추천 취소
router.delete('/decreaseUp',checkReferrer, async(req,res) => {

    try {
        let userId = req.body.userId;
        let postId = req.body.postId;
    
        if(userId && postId) {
            let result = await sqlToBoardTable.decreaseUp(postId);
            if(result) {
                db.query('DELETE FROM Up WHERE user_id=? AND board_no=?',[userId,postId],(err,data) => {
                    if(err){
                        console.log('DELETE /post/decreaseUp ',err);
                        return res.status(500).json({message: err.code});
                    }else{
                        return res.status(200).json({result: true, message:'추천을 취소하였습니다'});
                    }
                });
            }
        }else {
            res.status(400).json({message: 'userId invalid or postId invalid'});
        }

    }catch(err) {
        console.log('DELETE /post/decreaseUp ',err);
        return res.status(500).json({ message: err.code });
    }
});

//* 게시물 삭제
router.delete('/deletePost',checkReferrer,(req,res) => {
    let userId = req.body.userId;
    let postId = req.body.postId;

    if(userId && postId) {
        db.query('DELETE FROM Board WHERE user_id=? AND board_no=?',[userId,postId],(err,data) => {
            if(err){
                console.log('DELETE /post/deletePost ',err);
                res.status(500).json({ message: err.code });
            }else{
                res.status(200).json({ result: true });
            }
        });
    }else {
        res.status(400).json({ message: 'userId invalid or postId invalid' });
    } 
});


module.exports = router;