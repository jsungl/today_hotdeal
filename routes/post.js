const express = require('express');
const db = require('../config/db');
const getPost = require('../modules/post/getBoardTable');
const updatePost = require('../modules/post/updateBoardTable');
const getImage = require('../modules/post/getImageTable');
const router = express.Router();

//* 데이터 총 개수, 1번째 페이지(0~10) 데이터 조회 -> Home 컴포넌트
router.get('/getTotalCount',(req, res) => {
    const sql1 = 'SELECT count(*) count FROM Board;'; //쿼리 2개 날릴 때 ; 중요
    const sql2 = 'SELECT * FROM Board ORDER BY board_no desc limit 10 offset 0';
    db.query(sql1+sql2,(err, data) => {
        if(!err){
            res.send(data);
        } else {
            res.send(err);
        }
    });
});


//* 게시물 목록 조회(정렬방법, 검색방법, 페이징) 
router.get('/getBoardList',(req, res) => {
    let mainSQL = '';
    let subSQL = 'SELECT count(*) FROM Board';
    const keyword = '%' + req.query.keyword + '%';
    switch (req.query.target) {
      case 'title':
          //제목
          subSQL += ` WHERE title like ${db.escape(keyword)}`;    
          mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE title like ${db.escape(keyword)}`;
          break;
      case 'content':
          //내용
          subSQL += ` WHERE text_content like ${db.escape(keyword)}`;
          mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE text_content like ${db.escape(keyword)}`;
          break;
      case 'writer':
          //글쓴이     
          subSQL += ` WHERE user_id like ${db.escape(keyword)}`;
          mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE user_id like ${db.escape(keyword)}`;
          break;
      default:
          //제목+내용
          subSQL += ` WHERE title like ${db.escape(keyword)} OR text_content like ${db.escape(keyword)}`;
          mainSQL = 'SELECT *,(' + subSQL + `) count FROM Board WHERE title like ${db.escape(keyword)} OR text_content like ${db.escape(keyword)}`;
          break;
    }
  
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
  
    db.query(mainSQL,[Number(req.query.limit),Number(req.query.offset)],(err, data) => {
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
        let userInfo = req.cookies['user'];
        //console.log('userInfo: ',userInfo);
        let myIp = getUserIP(req);

        if(req.cookies[myIp] === undefined){
            //res.cookie('postId',postId,{ sameSite: 'none', secure: true});
            res.cookie(myIp,postId,{
                // 유효시간 1일    
                maxAge: 1000 * 60 * 60 * 24
            });
            await updatePost.increaseView(postId);
        }else{
            if(!req.cookies[myIp].includes(postId)) {
                let oldValue = req.cookies[myIp];
                let newValue = oldValue + '_' + postId;
                res.cookie(myIp,newValue,{
                    maxAge: 1000 * 60 * 60 * 24
                });
                await updatePost.increaseView(postId);
            }
        }
        
        if(userId) { //로그인한 경우
            let data = await getPost.allByPostIdOnLogin(postId,userId);
            if(data.length === 0) {
                return res.status(404).json({message:'게시물이 존재하지 않습니다.'}); //410도 맞을것같다
            }else {
                return res.send(data);
            }
        }else { //비로그인
            let data = await getPost.allByPostId(postId);
            if(data.length === 0) {
                return res.status(404).json({message:'게시물이 존재하지 않습니다.'}); //410도 맞을것같다
            }else {
                return res.send(data);
            }
        }

    }catch(err) {
        console.log(err);
        //res.send(err);
    }
});

//* 게시물 등록
router.post('/uploadPost',(req,res) => {
    let title = req.body.postTitle;
    let category = req.body.postCategory;
    let url = req.body.postUrl;
    let mall = req.body.productMall;
    let name = req.body.productName;
    let price = req.body.productPrice;
    let dc = req.body.deliveryCharge;
    let userId = req.body.userId;
    let textContent = req.body.textContent;
    let htmlContent = req.body.htmlContent;

    db.query('INSERT INTO Board(title,html_content,text_content,user_id,category,product_url,product_mall,product_name,product_price,delivery_charge) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [title,htmlContent,textContent,userId,category,url,mall,name,price,dc],(err,data) => {
            if (err) {
                console.log('/uploadPost error :: ',err);
                res.status(500).json({uploaded: false, error: {message:'Upload Fail!'}});
            } else{
                const postId = data.insertId;
                console.log("/uploadPost postId ::",postId);
                res.status(200).json({uploaded: true, message:'Upload Success!',postId});
            }
        }
    );

});

//* 게시물 이미지 경로 변경(임시폴더->영구폴더)
router.post('/updateImagePath',(req,res) => {
    let userId = req.body.userId;
    let postId = req.body.postId;
    let uploadImgNames = req.body.data;
    console.log('/updateImagePath 업로드한 이미지 ::',uploadImgNames);
    
    db.query('SELECT html_content,title FROM Board WHERE board_no=?',[postId],(err,data) => {
        if (err) {
            res.status(500).json({ error: err});
        } else{
            //console.log('data ::',data);
            const content = data[0].html_content;
            const title = data[0].title;
            const newContent = content.replaceAll(`temp/${userId}`,`posts/${postId}`);
            db.query('UPDATE Board SET html_content=? WHERE board_no=?',[newContent,postId],(err,data) => {
                if(err) {
                    console.log('Image path Update Error ::',err);
                    res.status(500).json({updated:false, error:{message:'Image path Update Fail!'}});
                } else {
                    if(uploadImgNames){
                        db.query('INSERT INTO Image(board_no,title,file_name) VALUES(?,?,?)',[postId,title,uploadImgNames],(err,data) => {
                            if(err){
                                console.log('Image Table Upload Error ::',err);
                                res.status(500).json({updated:false, error:{message:'Image Table Upload Fail!'}});
                            }else{
                                res.status(200).json({updated:true, message:'Image path Update & Image Table Upload Success!'});
                            }
                        });
                    }else{
                        res.status(200).json({updated:true, message:'Image path Update Success!'});
                    }
                }
            });
        }
    });
});

//* 게시물 수정
router.put('/updatePost',(req,res) => {
    let title = req.body.postTitle;
    let name = req.body.productName;
    let price = req.body.productPrice;
    let dc = req.body.deliveryCharge;
    let postId = req.body.postId;
    let textContent = req.body.textContent;
    let htmlContent = req.body.htmlContent;

    db.query('UPDATE Board SET title=?, html_content=?, text_content=?, product_name=?, product_price=?, delivery_charge=? WHERE board_no=?',
        [title,htmlContent,textContent,name,price,dc,postId],(err,data) => {
            if (err) {
                console.log('/updatePost error :: ',err);
                return res.status(500).json({updated: false, error: {message:'Update Fail!'}});
            } else{
                return res.status(200).json({updated: true, message:'Update Success!'});
            }
        }
    );
});

//* 게시물 정보와 이미지 파일 조회(게시글 수정시)
router.get('/getBoardInfo',async(req, res) => {
    try {
        let postId = req.query.postId;
        let data = await getPost.allByPostId(postId);
        const boardInfo = data;
        let data2 = await getImage.fileNameByPostId(postId);
        console.log("/getBoardInfo 이미지 파일 ::",data2);
        res.status(200).json({boardInfo,imageNames:data2[0] === undefined ? null : data2[0].file_name});

    }catch(err) {
        console.log('/GET getBoardInfo ',err);
        res.send(err);
    }
});

//* 게시물 이미지 파일 이름 수정
router.put('/updateImageNames',async(req,res) => {
    try {
        const postId = req.body.postId;
        const updatedImgNames = req.body.files;
        console.log('수정시 업로드한 이미지 :',updatedImgNames);

        const data = await getImage.allByPostId(postId);
        console.log('게시물번호로 조회한 데이터 :',data);
        if(data[0] === undefined){ //DB에 저장된 이미지가 없는 게시글인 경우
            console.log('Image 테이블에 저장된 이미지가 없음');
            let title = await getPost.titleByPostId(postId);
            db.query('INSERT INTO Image(board_no,title,file_name) VALUES(?,?,?)',[postId,title,updatedImgNames],(err,data) => {
                if(err){
                    console.log(err);
                }else{
                    res.status(200).json({updated: true, message:'Update Image FIle Name Success!'});
                }
            });
        }else {
            console.log('Image 테이블에 저장된 이미지가 있음');
            db.query('UPDATE Image SET file_name=? WHERE board_no=?',[updatedImgNames,postId],(err,data) => {
                if(err){
                    console.log(err);
                }else{
                    res.status(200).json({updated: true, message:'Update Image FIle Name Success!'});
                }
        
            });
        }

    }catch(err) {
        console.log('/PUT updateImageNames ',err);
        res.send(err);
    }
});

//* 게시물 추천
router.post('/increaseUp',(req,res) => {
    let userId = req.body.userId;
    let postId = req.body.postId;
    
    if(userId && postId) {
        db.query('INSERT INTO Up(user_id,board_no) VALUES(?,?)',[userId,postId],(err,data) => {
            if(err){
                console.log('/POST increaseUp ',err);
                res.status(500).json({result: false, message:'추천에 실패하였습니다.'});
            }else{
                res.status(200).json({result: true, message:'게시물 추천하였습니다!'});
            }
        });
    }else {
        res.status(400).json({result: false, message:'추천에 실패하였습니다.'});
    }
});

//* 게시물 추천 취소
router.delete('/decreaseUp',(req,res) => {
    let userId = req.body.userId;
    let postId = req.body.postId;

    if(userId && postId) {
        db.query('DELETE FROM Up WHERE user_id=? AND board_no=?',[userId,postId],(err,data) => {
            if(err){
                console.log('/DELETE decreaseUp ',err);
                res.status(500).json({result: false});
            }else{
                res.status(200).json({result: true});
            }
        });
    }else {
        res.status(400).json({result: false});
    }
    
});

//* 게시물 삭제
router.delete('/deletePost',(req,res) => {
    let userId = req.body.userId;
    let postId = req.body.postId;

    if(userId && postId) {
        db.query('DELETE FROM Board WHERE user_id=? AND board_no=?',[userId,postId],(err,data) => {
            if(err){
                console.log('/DELETE deletePost ',err);
                res.status(500).json({result: false});
            }else{
                res.status(200).json({result: true});
            }
        });
    }else {
        res.status(400).json({result: false});
    } 
});


module.exports = router;