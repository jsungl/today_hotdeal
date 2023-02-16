/*eslint-disable*/
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Editor from '../Editor';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import store from '../../modules/index';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { setAsync, setAsyncSuccess, setAsyncError, setAsyncInit } from '../../modules/asyncReqState';
import { setPostInit, setPostNumber } from '../../modules/posts';


export default function BoardWrite() {
    console.log('=========BoardWrite Component Rendering=========');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const content = useSelector(state => state.postReducer.content);
    const postId = useSelector(state => state.postReducer.postId);
    const userId = useSelector(state => state.userReducer.userId);
    const loading = useSelector(state => state.asyncReqReducer.loading);
    const success = useSelector(state => state.asyncReqReducer.success);
    
    const userName = userId;
    const imageUpload = {list:[], flag:false};
    const style = {
       paddingRight:'10px'
    }

    const theme = createTheme({
        palette: {
          primary: {
            main: '#337ab7',
          },
        },
    });

    //* beforeunload 이벤트시 경고창 표시
    const preventClose = useCallback((e) => {
        e.preventDefault();
        e.returnValue = '';
    },[]);

    //* unload 이벤트시 임시폴더 삭제
    const deleteFolder = useCallback((e) => {
        console.log('unload event :: ',e);
    },[]);

    useEffect(() => {
        console.log('[BoardWrite] 컴포넌트 마운트');
        window.addEventListener('beforeunload',preventClose);
        window.addEventListener('unload',deleteFolder);

        return async() => {
            console.log('[BoardWrite] 컴포넌트 언마운트');
            window.removeEventListener('beforeunload',preventClose);
            window.removeEventListener('unload',deleteFolder);
            console.log('[BoardWrite] 언마운트 flag ::',store.getState().postReducer.flag);
            console.log('[BoardWrite] 언마운트 userId ::',userId);
            if(store.getState().postReducer.flag){
                try {
                    const res = await axios.delete(process.env.REACT_APP_DELETE_S3_TEMP_OBJECTS,{data:{userId}});
                    console.log('S3 임시폴더 삭제 :: ',res.data.deleted);
                    dispatch(setPostInit());
                } catch(err){
                    console.error(err);
                }
            }else{
                dispatch(setPostInit());
            }
        }
    },[userId,dispatch,preventClose,deleteFolder]);

    useEffect(() => {
        if (success) {
            dispatch(setAsyncInit());
            navigate(`/board/${postId}`,{replace:true});
        }
    }, [success, navigate, dispatch]);


    //* url 유효성 검사
    const checkUrl = (postUrl) => {
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/;
        if(!urlRegex.test(postUrl)){
            alert('url 형식이 잘못되었습니다.');
            return false;
        }else{
            return true;
        }
    }

    //* content를 html과 text로 나누기
    const devideContent = (content) => {
        const textContent = content.replace(/<[^>]*>?/g,'');
        return textContent;
    }

    //* 에러 발생시 게시물 삭제
    const deletePost = async(userId,postId) => {
        console.log('[BoardWrite] 게시물 이미지 업로드 오류');
        try {
            let res = await axios.delete(`${process.env.REACT_APP_URL}/post/deletePost`,{ data:{ userId, postId } });
            res.data.result && console.log('이미지 업로드시 오류가 발생하여 삭제하였습니다');

        }catch(err) {
            console.error(err.reponse.data.message);
        }
    }

    //* 게시물 업로드
    const uploadPost = async(userId,postId) => {
        try {
            const result = await axios.put(process.env.REACT_APP_MOVE_S3_OBJECTS,{userId,postId,uploadList:imageUpload.list}); //응답으로 경로가 포함된 이미지 이름 배열을 받는다
            if(result.status === 200){
                console.log('[BoardWrite] S3moveObject 람다함수로부터 응답결과 ::',result);
                const temp = []; //경로에서 이름만 잘라 저장할 임시배열
                //FIXME: push 사용하지 말것!
                result.data.map(data=>temp.push(data.split("/").slice(-1)[0]));
                console.log('[BoardWrite] 영구폴더로 업로드한 이미지 파일 ::',temp);                
                let data = JSON.stringify(temp);
                const result2 = await axios.post(`${process.env.REACT_APP_URL}/post/updateImagePath`,{
                    userId,
                    postId,
                    data
                });
                if(result2.data.updated) {
                    alert('upload success!');
                    dispatch(setAsyncSuccess()); //요청성공
                }
            }

        }catch(err) {
            console.error(err.response.data.message);
            if(err.response.status === 500) { //람다함수 실행오류 or DB 이미지 경로 변경 오류
                deletePost(userId,postId);
            }
            alert('upload fail!');
            dispatch(setAsyncError()); //요청 실패
        }
    }

    //* 게시물 등록시 업로드 전 폼으로부터 데이터 추출 및 유효성 검사
    const handleSubmit = async(e) => {
        try {
            e.preventDefault();
            if(content.length !== 0 && userId !== ""){
                console.log('[BoardWrite] 게시글 등록!');
                const data = new FormData(e.currentTarget); 
                const textContent = devideContent(content);
                const imgSrcReg = /(<img[^>]*src\s*=\s*[^>]*>)/g; //img 태그 안에 src 찾는 정규식
                const figureStyleReg = /(<figure[^>]*style\s*=\s*[^>]*>)/gi;
                const figureReg = /(<figure[^>]*>)/gi;
                let htmlContent = content;

                if(imgSrcReg.test(htmlContent)){ //본문에 이미지가 있는지 찾는다 -> 복붙한 이미지인지 업로드한 이미지인지 확인
                    if(htmlContent.includes('/temp/')) { 
                        imageUpload.flag = true;
                        dispatch(setAsync()); //요청시작
                    }
                    htmlContent = htmlContent.replaceAll('<img','<img style="max-width:100%!important"');

                    htmlContent.match(figureReg).map((data) => { //이미지 업로드시 중앙에 위치시키기 위해 style 속성 수정(정규식)
                        if (figureStyleReg.test(data)) {
                            const styles = data.match(/<figure [^>]*style="[^"]*"[^>]*>/gm).map(x => x.replace(/.*style="([^"]*)".*/, '$1'));
                            const stylesData = styles[0];
                            const temp = data.replace(stylesData,"text-align:center;margin:auto;"+stylesData);
                            htmlContent = htmlContent.replaceAll(data, temp);
                        } else {
                            const temp2 = data.replaceAll('<figure','<figure style="text-align:center;margin:auto;"');
                            if (!figureStyleReg.test(data)) {
                                htmlContent = htmlContent.replaceAll(data, temp2);
                            }
                        }
                        return htmlContent;
                    });

                    htmlContent.match(imgSrcReg).map((data) => { //게시글에 있는 업로드한 이미지 파일 이름을 배열에 추가
                        if (data.includes('/temp/')) {
                            let sources = data.match(/<img [^>]*src="[^"]*"[^>]*>/gm).map(x => x.replace(/.*src="([^"]*)".*/, '$1'));
                            let fileName = sources[0].replace(/^.*\//, '');
                            //FIXME: push 사용하지 말것!
                            imageUpload.list.push(fileName);
                        }
                        return htmlContent;
                    });
                }

                const uploadData = {
                    postCat:data.get('postCategory'),
                    postUrl: data.get('postUrl'),
                    prdctMall: data.get('productMall'),
                    prdctName: data.get('productName'),
                    prdctPrice: data.get('productPrice'),
                    dlvyChrg: data.get('deliveryCharge'),
                    userId: userName,
                    textContent,
                    htmlContent
                };
                const {postUrl,prdctMall,prdctName,prdctPrice,dlvyChrg,userId} = uploadData;
                const fee = Number(dlvyChrg) === 0 ? '무료' : dlvyChrg + '원';
                uploadData.postTitle = `[${prdctMall}] ${prdctName} (${prdctPrice}원) (${fee})`;
                console.log('[BoardWrite] uploadData ::',uploadData);
                
                if(checkUrl(postUrl)) {
                    const result = await axios.post(`${process.env.REACT_APP_URL}/post/uploadPost`,uploadData); 
                    if(result.data.uploaded){
                        console.log('[BoardWrite] 본문에 이미지 있는지 확인 ::',imageUpload.flag);                        
                        dispatch(setPostNumber(result.data.postId));
                        if(imageUpload.flag) {
                            let postNumber = result.data.postId;
                            uploadPost(userId,postNumber);
                        }else {
                            alert('Upload Success!');
                            dispatch(setAsyncSuccess()); //요청 성공
                        }
                    }             
                }

            }else {
                alert('내용을 입력하세요!');
            }

        }catch(err) {
            console.error(err.response.data.message);
            alert('upload fail!');
            dispatch(setAsyncError()); //요청 실패
        }

    }

    return(
        <>
            <Backdrop 
                sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <Typography variant="h5" align="center" gutterBottom sx={{borderBottom:"1px solid #888"}}>
                핫딜 등록
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{marginTop:"30px",marginBottom:"50px"}}>
                    <table>
                        <tbody>
                            <tr>
                                <td style={style}>상품 분류</td>
                                <td>
                                    <TextField select name="postCategory" size="small" defaultValue={0}>
                                        <MenuItem value={0}>먹거리</MenuItem>
                                        <MenuItem value={1}>PC제품</MenuItem>
                                        <MenuItem value={2}>가전제품</MenuItem>
                                        <MenuItem value={3}>생활용품</MenuItem>
                                        <MenuItem value={4}>의류</MenuItem>
                                        <MenuItem value={5}>세일정보</MenuItem>
                                    </TextField>
                                </td>
                            </tr>
                            <tr>
                                <td style={style}>URL 링크</td>
                                <td><TextField name="postUrl" size="small" margin="dense" sx={{width:300}} type="url" required/></td>
                            </tr>
                            <tr>
                                <td>쇼핑몰</td>
                                <td><TextField name="productMall" size="small" margin="dense" required/></td>
                            </tr>
                            <tr>
                                <td>상품명</td>
                                <td><TextField name="productName" size="small" margin="dense" required/></td>
                            </tr>
                            <tr>
                                <td>가격</td>
                                <td><TextField name="productPrice" size="small" margin="dense" type="number" required/></td>
                            </tr>
                            <tr>
                                <td>배송비</td>
                                <td><TextField name="deliveryCharge" size="small" margin="dense" type="number" required/></td>
                            </tr>
                        </tbody>
                    </table>
                </Box>
                <Editor userId={userId}/>
                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    spacing={2}
                    sx={{
                        mt:3,
                        mb:2
                    }}
                >
                    <ThemeProvider theme={theme}>
                        <Button type="submit" variant="contained" size="small">등록</Button>
                        <Button variant="contained" size="small" onClick={()=>navigate('/')}>취소</Button>
                    </ThemeProvider>
                </Stack>
            </Box>
        
        </>
    );
};