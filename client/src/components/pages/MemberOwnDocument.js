//import { useLayoutEffect, useState } from 'react';
//import { useSelector } from 'react-redux';
//import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import MemberInfoHeader from '../MemberInfoHeader';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function MemberOwnDocument() {
    const location = useLocation();
    // const isLogined = useSelector(state => state.userReducer.isLogined);
    // const userId = useSelector(state => state.userReducer.userId);
    const isLogined = location.state.isLogined;
    const userId = location.state.userId;
    const post = location.state.post;
    
    console.log('[MemberOwnDocument] isLogined :',isLogined);
    console.log('[MemberOwnDocument] userId :',userId);
    //console.log('[MemberOwnDocument] post :',post);

    const params = useParams();
    const file = params.file;
    console.log(file);

    let index;
    if(file === 'myDocuments') {
        index = 1;
    }else if(file === 'myComments') {
        index = 2;
    }


    return(
        <>
            <MemberInfoHeader index={index} info={{isLogined, userId}} post={post}/>
            <Box sx={{ mt: 5, mb: 10 }}>
                {index === 1 ?
                    <Table sx={{ minWidth: 650}}>
                        <TableHead sx={{background:'#F6F6F6',borderTop: "1px solid #ccc", whiteSpace:'nowrap'}}>
                            <TableRow>
                                <TableCell align="center" sx={{fontWeight:'bold'}}>No.</TableCell>
                                <TableCell align="center" sx={{fontWeight:'bold'}}>카테고리</TableCell>
                                <TableCell align="center" sx={{fontWeight:'bold', width:'100%'}}>제목</TableCell>
                                <TableCell align="center" sx={{fontWeight:'bold'}}>조회</TableCell>
                                <TableCell align="center" sx={{fontWeight:'bold'}}>추천</TableCell>
                                <TableCell align="center" sx={{fontWeight:'bold'}}>날짜</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{whiteSpace:'nowrap'}}>
                            {
                                post.length !== 0 ? 
                                    post.map((data,index)=>(
                                        <TableRow key={index}>
                                            <TableCell align="center">{index}</TableCell>
                                            <TableCell align="center">{data.category}</TableCell>
                                            <TableCell align="center">{data.title}</TableCell>
                                            <TableCell align="center">{data.hits}</TableCell>
                                            <TableCell align="center">{data.up}</TableCell>
                                            <TableCell align="center">{data.enroll_date.substring(0,10)}</TableCell>
                                        </TableRow>
                                    )) : 
                                    <TableRow>
                                        <TableCell align="center" colSpan={6}>등록된 글이 없습니다.</TableCell>
                                    </TableRow>
                            }
                        </TableBody>
                    </Table>
                :
                    <Table sx={{ minWidth: 650}}>
                        <TableHead sx={{background:'#F6F6F6',borderTop: "1px solid #ccc", whiteSpace:'nowrap'}}>
                            <TableRow>
                                <TableCell align="center" sx={{fontWeight:'bold'}}>No.</TableCell>
                                <TableCell align="center" sx={{fontWeight:'bold'}}>카테고리</TableCell>
                                <TableCell align="center" sx={{fontWeight:'bold', width:'100%'}}>내용</TableCell>
                                <TableCell align="center" sx={{fontWeight:'bold'}}>추천</TableCell>
                                <TableCell align="center" sx={{fontWeight:'bold'}}>날짜</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell align="center" colSpan={6}>작성한 댓글이 없습니다.</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                }
            </Box>
        </>
    )
}