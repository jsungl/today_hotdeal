import {useLayoutEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import IconButton from '@mui/material/IconButton';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import styles from '../../style/Board.module.css';

//axios.defaults.withCredentials = true;

const TopArea = styled.div`
    padding: 10px;
    border-top: 1px solid #ccc; 
    border-bottom: 1px solid #ccc;
    background-color: #fcfcfc; 
`;
const BotArea = styled.div`
    border-bottom: 1px solid #eee;
`

export default function Board() {
    console.log('=========Board Component Rendering=========');
    const params = useParams();
    const postId = params.postId;
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [user, setUser] = useState('');
    const [date,setDate] = useState('');
    const [hits,setHits] = useState(0);
    const [up,setUp] = useState(0);
    const [url, setUrl] = useState('');
    const [mall, setMall] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [charge, setCharge] = useState(0);
    const [clickedUp, setClickedUp] = useState(false);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const userId = useSelector(state => state.userReducer.userId); //로그인한 사용자 ID
    console.log('[Board] userId: ',userId);
    const navigate = useNavigate();

    useLayoutEffect(() => {
        async function fetchData() {
            await axios
                .get(`${process.env.REACT_APP_URL}/post/getBoardContent`, {
                    params: {
                        'postId': postId,
                        'userId': userId
                    }
                })
                .then((res) => {
                    console.log(res);
                    setTitle(res.data[0].title);
                    setContent(res.data[0].html_content);
                    setUser(res.data[0].user_id);
                    setDate(res.data[0].enroll_date.substring(0,10));
                    setHits(res.data[0].hits);
                    setUp(res.data[0].up);
                    setUrl(res.data[0].product_url);
                    setMall(res.data[0].product_mall);
                    setName(res.data[0].product_name);
                    setPrice(res.data[0].product_price);
                    setCharge(res.data[0].delivery_charge);
                    res.data[0].up_chk === 1 && setClickedUp(true);
                    setLoading(false);
                    console.log('[Board Component] 컴포넌트 마운트');
                })
                .catch((err) => {
                    console.error(err);
                    if(err.response.status === 404) {
                        alert(err.response.data.message);
                        navigate('/');
                    }
                });
        };
        fetchData();
    },[postId,userId,navigate]);

    //* 게시글 추천
    const handleUpBtn = async() => {
        try {
            if(!clickedUp) {
                const res = await axios.post(`${process.env.REACT_APP_URL}/post/increaseUp`,{ postId, userId });
                if(res.data.result) {
                    alert(res.data.message);
                    setClickedUp(true);
                }
            }else {
                const res = await axios.delete(`${process.env.REACT_APP_URL}/post/decreaseUp`,{ data: { postId, userId } });
                if(res.data.result) {
                    setClickedUp(false);
                }
            }

        }catch(err) {
            console.log(err);
            if(err.response.status === 500 || err.response.status === 400) {
                alert(err.response.data.message);
            }
        }
    }

    //* 게시글 삭제
    const deletePost = async() => {
        try {
            const s3_result = await axios.delete(process.env.REACT_APP_DELETE_S3_POST_OBJECTS,{data:{postId},withCredentials: false}); //S3 영구폴더에서 이미지 삭제
            console.log(s3_result);
            if(s3_result.status === 200) {
                const db_result = await axios.delete(`${process.env.REACT_APP_URL}/post/deletePost`,{ data: { postId, userId } });
                if(db_result.data.result) {
                    navigate('/',{replace:true});
                }
            }
        }catch(err) {
            console.log(err);
            setOpen(false);
        }

    }

    const handleDeleteBtn = () => {
        if (window.confirm('게시글을 삭제하시겠습니까?')) {
            deletePost();
            setOpen(true);
        }else {
            return;
        }
    }

    return (
        <>
            {loading ?
                <Box sx={{width:"100%"}}/>
            :
            <>
                <Backdrop 
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={open}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Box>
                    <TopArea>
                        <Stack  direction="row" justifyContent="space-between" alignItems="center" spacing={4}>
                            <Typography
                                variant="h5"
                                color="inherit"
                                align="left"
                            >
                                {title}
                            </Typography>
                            <span style={{whiteSpace:"nowrap"}}>{date}</span>
                        </Stack>
                    </TopArea>
                    <BotArea>
                        <div className={styles.writerDiv}>{user}</div>
                        <div className={styles.hitsDiv}>
                            <span className={styles.span}>조회 수 <b className={styles.b}>{hits}</b></span>
                            <span className={styles.span}>추천 수 <b className={styles.b}>{up}</b></span>
                            <span className={styles.span}>댓글 <b className={styles.b}>0</b></span>
                        </div>        
                    </BotArea>
                </Box>
                <Box>
                    <Table aria-label="simple table" size="small">
                        <TableBody sx={{borderTop: "1px solid #ccc"}}>
                            <TableRow>
                                <TableCell component="th" sx={{background:"#F6F6F6", width:100, whiteSpace: "nowrap"}}>관련 URL</TableCell>
                                <TableCell><a href={url} target="_blank" rel="noopener noreferrer" style={{color:'#000', wordBreak: "break-all"}}>{url}</a></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" sx={{background:"#F6F6F6", width:100}}>쇼핑몰</TableCell>
                                <TableCell>{mall}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" sx={{background:"#F6F6F6", width:100}}>상품명</TableCell>
                                <TableCell>{name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" sx={{background:"#F6F6F6", width:100}}>가격</TableCell>
                                <TableCell>{price.toLocaleString()} 원</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" sx={{background:"#F6F6F6", width:100}}>배송비</TableCell>
                                <TableCell>{charge === 0 ? '무료' : charge.toLocaleString() + '원'} </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>
                
                <Box sx={{marginTop:10, marginBottom:10}}>
                    <div className={styles.articleDiv} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(content)}} />
                    <Box sx={{paddingTop:10}}>
                        <Stack
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <IconButton size="large" color={clickedUp ? 'primary' : ''} onClick={handleUpBtn}>
                                <ThumbUpIcon />
                            </IconButton>
                        </Stack>
                    </Box>
                </Box>
                {
                    user === userId &&
                        <Box>
                            <Stack
                                direction="row"
                                justifyContent="flex-end"
                                alignItems="flex-end"
                                spacing={2}
                            >
                                <Button variant="outlined" size="large" onClick={()=>{navigate(`/boardUpdate/${postId}`)}}>수정</Button>
                                <Button variant="outlined" size="large" onClick={handleDeleteBtn}>삭제</Button>
                            </Stack>    
                        </Box>
                }
            </>
            }
        </>
    );
}