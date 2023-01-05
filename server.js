const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const db = require('./dbconfig/db');

if (process.env.NODE_ENV === 'production') {
    require("dotenv").config({ path: path.join(__dirname, '.env.production') });
} else {
    //require("dotenv").config(); dotenv 모듈 불러오기
    require("dotenv").config({ path: path.join(__dirname, '.env.development') });
}

const port = process.env.PORT; //port 번호

/* cors 오류 해결 */
const cors = require('cors');
app.use(cors());
app.use(express.json()); // 클라이언트에서 application/json 데이터를 보냈을때 파싱해서 body 객체에 넣어줌
app.use(express.urlencoded({ extended: true })); // 클라이언트에서 application/x-www-form-urlencoded 데이터를 보냈을때 파싱해서 body 객체에 넣어줌
app.use(cookieParser({ sameSite: "Lax" }));

//app.use(express.static(path.join(__dirname, 'client/build')));
//app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.get('/', function(req,res) {
    res.send('hello node.js server')
    //res.sendFile(path.join(__dirname, 'client/build/index.html'))
});


/**
 * RDS 연결
 */

//* 데이터 총 개수, 1번째 페이지(0~10) 데이터 조회 -> Home 컴포넌트
app.get('/getTotalCount',(req, res) => {
    const sql1 = 'SELECT count(*) count FROM Board;'; //쿼리 2개 날릴 때 ; 중요
    const sql2 = 'SELECT * FROM Board ORDER BY board_no desc limit 10 offset 0';
    db.query(sql1+sql2,(err, data) => {
      if(!err){
          res.send(data);
      } else {
          res.send(err);
      }
    })
});


//* 게시글 목록 조회(정렬방법, 검색방법, 페이징) 
app.get('/getBoardList',(req, res) => {
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
    })
});

//* 게시글 정보 조회(상세보기)
app.get('/getBoardContent',(req, res) => {
    let postId = req.query.postId;
    db.query('SELECT * FROM Board WHERE board_no = ?',[postId],(err, data) => {
      if(err) {
        res.send(err);
      } else {
        res.send(data);
      }
    })
});

//* 게시글 등록
app.post('/uploadPost',(req,res) => {
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

//* 게시글 이미지 경로 변경(임시폴더->영구폴더)
app.post('/updateImagePath',(req,res) => {
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

//* 게시글 수정
app.put('/updatePost',(req,res) => {
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
                res.status(500).json({updated: false, error: {message:'Update Fail!'}});
            } else{
                res.status(200).json({updated: true, message:'Update Success!'});
            }
        }
    );
});

//* 게시글 정보와 이미지 파일 조회
app.get('/getBoardInfo',(req, res) => {
    let postId = req.query.postId;
    db.query('SELECT * FROM Board WHERE board_no = ?',[postId],(err, data) => {
      if(err) {
        console.log('/getBoardInfo error1 ::',err);
        res.send(err);
      } else{
            const boardInfo = data;
            db.query('SELECT file_name FROM Image WHERE board_no=?',[postId],(err,data2) => {
              if(err) {
                console.log('/getBoardInfo error2 ::',err);
                res.send(err);
              } else{
                console.log("/getBoardInfo 이미지 파일 ::",data2);
                res.status(200).json({boardInfo,imageNames:data2[0] === undefined ? null : data2[0].file_name});
              }
            });
        }
    });
});

//* 게시글 이미지 파일 이름 수정
app.put('/updateImageNames',(req,res) => {
    const postId = req.body.postId;
    const updatedImgNames = req.body.files;
    console.log('/updateImageNames 수정시 업로드한 이미지 ::',updatedImgNames);
    //let subSQL = `SELECT title FROM Board WHERE board_no=${postId}`; 제목 조회하는 서브쿼리

    db.query('SELECT * FROM Image WHERE board_no=?',[postId],(err,data) => {
        if(err){
            console.log('/updateImageNames error :: ',err);
            res.send(err);
        }else {
            console.log('/updateImageNames data ::',data);
            if(data[0] === undefined){ //DB에 저장된 이미지가 없는 게시글인 경우
                db.query('INSERT INTO Image(board_no,title,file_name) SELECT ?,title,? FROM Board WHERE board_no=?',[postId,updatedImgNames,postId],(err,data) => {
                    if(err){
                        console.log('/updateImageNames error :: ',err);
                        res.send(err);
                    }else{
                        res.status(200).json({updated: true, message:'Update Image FIle Name Success!'});
                    }
                });
            }else{
                db.query('UPDATE Image SET file_name=? WHERE board_no=?',[updatedImgNames,postId],(err,data) => {
                    if(err){
                        console.log('/updateImageNames error :: ',err);
                        res.send(err);
                    }else{
                        res.status(200).json({updated: true, message:'Update Image FIle Name Success!'});
                    }
            
                });
            }
        }

    });
})

// app.get('*', function(req,res) {
// 	res.sendFile(path.join(__dirname, 'client/build/index.html'))
// });

app.listen(port, function () {
    console.log(`listening on ${port}`);
});