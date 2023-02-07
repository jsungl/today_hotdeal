import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
//import Editor from '../Editor';
import UpdateEditor from '../UpdateEditor';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import store from '../../modules/index';
import { setAsync, setAsyncSuccess, setAsyncError, setAsyncInit } from '../../modules/asyncReqState';
import { setPostInit } from '../../modules/posts';



export default function BoardUpdate() {
    console.log('=========BoardUpdate Component Rendering=========');
    const params = useParams();
    const postId = params.postId; //string
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [category, setCategory] = useState(0);
    const [originData, setOriginData] = useState(''); //문자열로 저장된 이미지 이름 배열
    const [user, setUser] = useState('');
    const [url, setUrl] = useState('');
    const [mall, setMall] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [charge, setCharge] = useState(0);

    const content = useSelector(state => state.postReducer.content);
    const userId = useSelector(state => state.userReducer.userId);
    //const flag = useSelector(state => state.postReducer.flag);
    const loading = useSelector(state => state.asyncReqReducer.loading);
    const success = useSelector(state => state.asyncReqReducer.success);

    //const userName = post.userId;
    const imageUpload = {flag: false}; //본문에 이미지가 있는지 확인
    const imgNamesArr = {originList:[], deletedList:[], uploadList:[]}; //기존에 저장되어 있는 이미지 배열,수정시 삭제한 이미지 배열,새로 업로드한 이미지 배열
    const [originImg,setOriginImg] = useState(''); //문자열로 변환한 기존에 저장되어 있는 이미지 배열, 저장되어 있지 않으면 NULL

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
        // if(post.flag){
        //     axios.delete(process.env.REACT_APP_DELETE_S3_OBJECTS,{data:{userId:userName}})
        //     .then(res=>console.log(res))
        //     .catch(err=>console.error(err));
        // }
    },[]);

    useEffect(() => {
        console.log('[BoardUpdate] 컴포넌트 마운트');
        window.addEventListener('beforeunload',preventClose);
        window.addEventListener('unload',deleteFolder);

        return async() => {
            console.log('[BoardUpdate] 컴포넌트 언마운트');
            window.removeEventListener('beforeunload',preventClose);
            window.removeEventListener('unload',deleteFolder);
            console.log('[BoardUpdate] 언마운트 flag ::',store.getState().postReducer.flag);
            console.log('[BoardUpdate] 언마운트 userId ::',user);
            if(store.getState().postReducer.flag){
                try {
                    const res = await axios.delete(process.env.REACT_APP_DELETE_S3_TEMP_OBJECTS,{data:{userId:user}});
                    console.log('S3 임시폴더 삭제 :: ',res.data.deleted);
                    dispatch(setPostInit());
                } catch(err){
                    console.error(err);
                }
            }else{
                dispatch(setPostInit());
            }
        }
    },[user,dispatch,preventClose,deleteFolder]);

    useEffect(() => {
        async function getPost() {
            await axios.get(`${process.env.REACT_APP_URL}/post/getBoardInfo`, {
                params: {
                    'postId': postId
                }
            })
            .then((res) => {
                setCategory(res.data.boardInfo[0].category);
                setOriginData(res.data.boardInfo[0].html_content);
                setUser(res.data.boardInfo[0].user_id);
                setUrl(res.data.boardInfo[0].product_url);
                setMall(res.data.boardInfo[0].product_mall);
                setName(res.data.boardInfo[0].product_name);
                setPrice(res.data.boardInfo[0].product_price);
                setCharge(res.data.boardInfo[0].delivery_charge);
                setOriginImg(res.data.imageNames);
                console.log('[BoardUpdate] 게시글 가져오기');
            })
            .catch(e => {
                console.error(e.message);
            });
        }
        getPost();
    },[postId]);

    useEffect(() => {
        if (success) {
            dispatch(setAsyncInit());
            navigate('/list',{replace:true});
        }
    }, [success, navigate, dispatch]);


    //* content를 html과 text로 나누기
    const devideContent = (content) => {
        const textContent = content.replace(/<[^>]*>?/g,'');
        //console.log('html 분리 후 content ::',textContent);
        return textContent;
    }

    //* 게시글 수정 업로드(S3 임시폴더->영구폴더, DB에서 이미지 경로 수정)
    const updatePost = async(userId,postId) => {
        try {
            // 이미지를 새로 올렸다가 삭제하고 다른것 올린경우 or 새로 올렸다가 삭제한 경우 -> 람다함수 수정
            const moveResult = await axios.put(process.env.REACT_APP_MOVE_S3_OBJECTS,{userId,postId,uploadList:imgNamesArr.uploadList});
            if(moveResult.status === 200){ //새로 업로드한 이미지 경로만 변경.
                const updateResult = await axios.post(`${process.env.REACT_APP_URL}/post/updateImagePath`,{
                    userId,
                    postId,
                    data:false
                });

                if(updateResult.data.updated){
                    if(imgNamesArr.deletedList.length !== 0){ //삭제한 이미지가 있는지 확인 -> 업로드 & 삭제 둘다 한 경우
                        let temp = [];
                        //FIXME: push 사용하지 말것!
                        moveResult.data.map(data=>temp.push(data.split("/").slice(-1)[0]));
                        //FIXME: push 사용하지 말것!
                        imgNamesArr.originList.push(...temp);
                        deleteS3Image(postId);
                    }else {
                        let temp = []; //경로에서 이름만 잘라 저장할 임시배열
                        //FIXME: push 사용하지 말것!
                        moveResult.data.map(data=>temp.push(data.split("/").slice(-1)[0]));
                        console.log('[BoardUpdate] 새로 추가한 이미지 ::',temp);
                        let data = JSON.stringify(temp); //문자열로 변환
                        let files = imgNamesArr.originList.length === 0 ? data : JSON.stringify(imgNamesArr.originList.concat(...temp)); //업데이트 할 이미지 이름 문자열(추가한 이미지 포함)

                        //이미지만 추가하여 수정한 경우
                        await axios.put(`${process.env.REACT_APP_URL}/post/updateImageNames`,{ 
                            postId,
                            files
                        });
                    } 
                    alert('Update Success!');
                    dispatch(setAsyncSuccess()); //요청 성공
                    //navigate('/list',{replace:true});
                }
            }
        }catch(err) {
            console.log('[BoardUpdate] 게시물 수정 업로드 실패 ::',err);
            alert('Update Fail!');
            dispatch(setAsyncError()); //요청 실패
        }
    }
    
    //*게시글 수정시 삭제한 이미지가 있으면 S3 영구폴더에서 해당 이미지 삭제 
    const deleteS3Image = async(postId) => {
        try{
            console.log('[BoardUpdate] 삭제한 파일 ',imgNamesArr.deletedList);
            const deleteResult = await axios.delete(process.env.REACT_APP_DELETE_S3_POST_OBJECTS,{data:{postId,userId:user,files:imgNamesArr.deletedList}});
            if(deleteResult.status === 200){ 
                //console.log(deleteResult);
                //console.log('[BoardUpdate Component] 삭제하기전 originList ::',imgNamesArr.originList);
                //FIXME: splice 메소드 사용하지 말것!
                imgNamesArr.deletedList.map(x=>imgNamesArr.originList.splice(imgNamesArr.originList.indexOf(x),1));
                let files = imgNamesArr.originList.length !== 0 ? JSON.stringify(imgNamesArr.originList) : null; //문자열로 변환
                const result = await axios.put(`${process.env.REACT_APP_URL}/post/updateImageNames`,{ //DB에서 삭제된 이미지 파일 삭제
                    postId,
                    files
                });
                console.log('[BoardUpdate] 이미지 삭제 요청 ::',result.data.updated);
            }
        }catch(err){
            console.log('[BoardUpdate] 이미지 삭제 요청 실패 ::',err);
            dispatch(setAsyncError()); //요청 실패
        }
    }

    //* 게시글 수정시 업로드 전 폼으로부터 데이터 추출 및 유효성 검사
    const handleSubmit = async(e) => {
        try {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const updateName = data.get('productName');
            const updatePrice = data.get('productPrice');
            const updateCharge = data.get('deliveryCharge');

            if(originData !== content || name !== updateName || price !== updatePrice || charge !== updateCharge){ //수정사항이 있는경우
                console.log('[BoardUpdate Component] 게시글 수정!');
                
                const textContent = devideContent(content);
                const imgSrcReg = /(<img[^>]*src\s*=\s*[^>]*>)/g; //img 태그 src 속성 찾는 정규식
                const figureStyleReg = /(<figure[^>]*style\s*=\s*[^>]*>)/gi; //figure 태그 style 속성 찾는 정규식
                const figureReg = /(<figure[^>]*>)/gi; //figure 태그 찾는 정규식
                let htmlContent = content;

                console.log('[BoardUpdate] DB에 저장되어 있는 기존 이미지 ',originImg);
                if(originImg){ //기존에 저장되어있는 이미지가 있는 경우(null이 아닌경우)
                    imgNamesArr.originList = JSON.parse(originImg); //배열로 변환
                    console.log('[BoardUpdate] DB에 저장되어 있는 이미지 배열로 변환 ',imgNamesArr.originList);
                }else{
                    //originImg = null인 경우
                    console.log('[BoardUpdate] DB에 저장되어 있는 기존 이미지 없음!',originImg);
                }

                if(imgSrcReg.test(htmlContent)){ //본문에 이미지가 있는지 확인
                    if(htmlContent.includes('/temp/')) { //이미지 경로에서 temp가 있는지 찾는다 -> 복붙한 이미지인지 업로드한 이미지인지 확인
                        imageUpload.flag = true;
                        dispatch(setAsync()); //요청시작
                    }
                    htmlContent = htmlContent.replaceAll('<img','<img style="max-width:100%!important"');

                    htmlContent.match(figureReg).map((data) => { //이미지를 중앙에 위치시키기 위해 figure 태그 style 속성 수정
                        if (figureStyleReg.test(data)) {
                          const styles = data.match(/<figure [^>]*style="[^"]*"[^>]*>/gm).map(x => x.replace(/.*style="([^"]*)".*/, '$1'));
                          const stylesData = styles[0];
                          const temp = data.replace(stylesData,"text-align:center;margin:auto;"+stylesData);
                          htmlContent = htmlContent.replaceAll(data, temp);
                        }else {
                          const temp2 = data.replaceAll(
                            '<figure',
                            '<figure style="text-align:center;margin:auto;"'
                          );
                          if (!figureStyleReg.test(data)) {
                            htmlContent = htmlContent.replaceAll(data, temp2);
                          }
                        }
                        return htmlContent;
                    });
                    
                    
                    //기존 DB에 저장되어 있는 이미지 이름 배열(originImgNames) 복사본을 하나 만든다
                    let copyImgNames = [...imgNamesArr.originList]; 

                    htmlContent.match(imgSrcReg).map((data)=>{
                        //if(data.includes('/posts/')){
                        if(data.includes(`/posts/${user}`)) {
                            //해당 이미지가 db에 저장되어 있는지 검사
                            //originImgNames가 null이 아니면 -> 기존에 저장되어 있는 이미지가 있다
                            for(var i=0; i<copyImgNames.length;i++){
                                if(data.includes(copyImgNames[i])){
                                    //console.log(copyImgNames[i]);
                                    //FIXME: splice 메소드 사용하지 말것!
                                    copyImgNames.splice(copyImgNames.indexOf(copyImgNames[i]),1);
                                    break;
                                }
                            }
                        }else {
                             //게시글에 있는 업로드한 이미지 파일 이름을 배열에 추가
                            if (data.includes(`/temp/${user}`)) {
                                let sources = data.match(/<img [^>]*src="[^"]*"[^>]*>/gm).map(x => x.replace(/.*src="([^"]*)".*/, '$1'));
                                let fileName = sources[0].replace(/^.*\//, '');
                                //FIXME: push 사용하지 말것!
                                imgNamesArr.uploadList.push(fileName);
                            }
                        }
                        return htmlContent; //map함수 반환을 변수에 정의하는것이 아니므로 의미없는 리턴값임
                    });
                    console.log('[BoardUpdate] 삭제한 이미지 파일 ',copyImgNames); //삭제하지 않았으면 빈 배열
                    console.log('[BoardUpdate] 새로 업로드한 이미지 파일2 ',imgNamesArr.uploadList); 

                    if(copyImgNames.length !== 0) imgNamesArr.deletedList = [...copyImgNames];

                }else {
                    // 글만 있는경우 or 이미지를 모두 삭제한 경우
                    if(imgNamesArr.originList.length !== 0){ //이미지를 모두 삭제한 경우
                        console.log('[BoardUpdate] 삭제한 이미지 파일 ',imgNamesArr.originList);
                        imgNamesArr.deletedList = [...imgNamesArr.originList];
                    }
                }

                const updateData = {
                    productName: data.get('productName'),
                    productPrice: data.get('productPrice'),
                    deliveryCharge: data.get('deliveryCharge'),
                    textContent,
                    htmlContent,
                    postId
                };
                const {productName,productPrice,deliveryCharge} = updateData;
                const fee = Number(deliveryCharge) === 0 ? '무료' : deliveryCharge + '원'; //배송비 0원 일 경우 무료로 설정
                updateData.postTitle = `[${mall}] ${productName} (${productPrice}원) (${fee})`; //게시글 제목 : "[쇼핑몰] 상품이름 (상품가격) (배송비)"
                console.log('[BoardUpdate] updateData ',updateData);
            
                const result = await axios.put(`${process.env.REACT_APP_URL}/post/updatePost`,updateData); //업데이트 폼 전송
                if(result.data.updated){
                    console.log('[BoardUpdate] 본문에 이미지 있는지 확인: ',imageUpload.flag);
                    if(imageUpload.flag) {
                        //이미지 업로드한 경우 or 삭제와 업로드 둘다 한 경우
                        updatePost(user,postId); //사용자ID와 게시글 Number 
                    }else {
                        //게시글만 수정한 경우 or 이미지만 삭제한 경우 or 이미지 복붙한 경우
                        if(imgNamesArr.deletedList.length !== 0){ //삭제한 이미지가 있는 경우(빈 배열이 아닌경우)
                            deleteS3Image(postId);
                        } 
                        alert('Update Success!');
                        dispatch(setAsyncSuccess()); //요청성공
                        //navigate('/list',{replace:true});
                    }

                }else { //업데이트 실패
                    console.log('[BoardUpdate] 업데이트 폼 전송 실패');
                    alert('Update Fail!');
                    dispatch(setAsyncError());
                }

            }else{ //수정사항이 없는경우
                alert('수정사항이 없습니다.');
                navigate('/list',{replace:true});
            }
        }catch(err) {
            console.log(err);
            dispatch(setAsyncError());
        }
    }

    return(
        <>
            <Backdrop 
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        
            <Typography variant="h5" align='center' gutterBottom sx={{borderBottom:'1px solid #888'}}>
                핫딜 수정
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{marginTop:'30px',marginBottom:'50px'}}>
                    <table>
                        <tbody>
                            <tr>
                                <td style={style}>상품 분류</td>
                                <td>
                                    <TextField select name="postCategory" size="small" value={category} disabled>
                                        <MenuItem value={0}>먹거리</MenuItem>
                                        <MenuItem value={1}>PC제품</MenuItem>
                                        <MenuItem value={2}>가전제품</MenuItem>
                                        <MenuItem value={3}>생활용품</MenuItem>
                                        <MenuItem value={4}>의류</MenuItem>
                                    </TextField>
                                </td>
                            </tr>
                            <tr>
                                <td style={style}>URL 링크</td>
                                <td><TextField name='postUrl' size="small" margin="dense" sx={{width:300}} type="url" value={url} disabled/></td>
                            </tr>
                            <tr>
                                <td>쇼핑몰</td>
                                <td><TextField name='productMall' size="small" margin="dense" value={mall} disabled/></td>
                            </tr>
                            <tr>
                                <td>상품명</td>
                                <td><TextField name='productName' size="small" margin="dense" value={name} required onChange={(e)=>{setName(e.target.value)}}/></td>
                            </tr>
                            <tr>
                                <td>가격</td>
                                <td><TextField name='productPrice' size="small" margin="dense" type="number" value={price} required onChange={(e)=>{setPrice(e.target.value)}}/></td>
                            </tr>
                            <tr>
                                <td>배송비</td>
                                <td><TextField name='deliveryCharge' size="small" margin="dense" type="number" value={charge} required onChange={(e)=>{setCharge(e.target.value)}}/></td>
                            </tr>
                        </tbody>
                    </table>
                </Box>
                <UpdateEditor userId={userId} content={originData}/>
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
                        <Button variant="contained" size="small" onClick={()=>navigate(-1)}>취소</Button>
                    </ThemeProvider>
                </Stack>
            </Box>
            
        </>
    );
};