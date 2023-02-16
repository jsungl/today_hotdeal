import { Link, useParams, useLocation } from 'react-router-dom';
import MemberInfoHeader from '../MemberInfoHeader';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';


const StyledLink = styled(Link)`
    color: black;
`;

export default function MemberOwnDocument() {
    const location = useLocation();
    const isLogined = location.state.isLogined;
    const userId = location.state.userId;
    const post = location.state.post;
    
    const params = useParams();
    const file = params.file;
    let index;
    if(file === 'myDocuments') {
        index = 1;
    }else if(file === 'myComments') {
        index = 2;
    }

    const category = [
        {value:0, name:'먹거리'},
        {value:1, name:'PC제품'},
        {value:2, name:'가전제품'},
        {value:3, name:'생활용품'},
        {value:4, name:'의류'},
        {value:5, name:'세일정보'}
    ];

    return(
        <>
            <MemberInfoHeader index={index} info={{isLogined, userId}} post={post}/>
            <Box sx={{ mt: 5, mb: 10 }}>
                {index === 1 ?
                    <Table sx={{ minWidth: 650}}>
                        <TableHead sx={{background: "#F6F6F6", borderTop: "1px solid #ccc", whiteSpace: "nowrap"}}>
                            <TableRow>
                                <TableCell align="center" sx={{fontWeight:"bold"}}>No.</TableCell>
                                <TableCell align="center" sx={{fontWeight:"bold"}}>카테고리</TableCell>
                                <TableCell align="center" sx={{fontWeight:"bold", width:"100%"}}>제목</TableCell>
                                <TableCell align="center" sx={{fontWeight:"bold"}}>조회</TableCell>
                                <TableCell align="center" sx={{fontWeight:"bold"}}>추천</TableCell>
                                <TableCell align="center" sx={{fontWeight:"bold"}}>날짜</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{whiteSpace:'nowrap'}}>
                            {
                                post.length !== 0 ? 
                                    post.map((data,index)=>(
                                        <TableRow key={index+1}>
                                            <TableCell align="center">{index+1}</TableCell>
                                            <TableCell align="center">{category.map(item=>item.value === data.category && item.name)}</TableCell>
                                            <TableCell align="center"><StyledLink to={`/board/${data.board_no}`}>{data.title}</StyledLink></TableCell>
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
                        <TableHead sx={{background: "#F6F6F6", borderTop: "1px solid #ccc", whiteSpace: "nowrap"}}>
                            <TableRow>
                                <TableCell align="center" sx={{fontWeight:"bold"}}>No.</TableCell>
                                <TableCell align="center" sx={{fontWeight:"bold"}}>카테고리</TableCell>
                                <TableCell align="center" sx={{fontWeight:"bold", width:"100%"}}>내용</TableCell>
                                <TableCell align="center" sx={{fontWeight:"bold"}}>추천</TableCell>
                                <TableCell align="center" sx={{fontWeight:"bold"}}>날짜</TableCell>
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