//import Table from 'react-bootstrap/Table';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const StyledLink = styled(Link)`
    color: black;
`;

export default function BoardListTable({post}) {

    const theadTitle = [
        {no:1,name:'No.'},
        {no:2,name:'제목'},
        {no:3,name:'글쓴이'},
        {no:4,name:'날짜'},
        {no:5,name:'조회수'},
        {no:6,name:'추천수'},
    ];

    return (
        <>
            <TableContainer sx={{mb:2}}>
            {post.length !== 0 ? (
                <Table sx={{ minWidth: 650}} aria-label="simple table">
                    <TableHead sx={{background:'#F6F6F6',borderTop: "1px solid #ccc"}}>
                        <TableRow>
                            {theadTitle.map((item) => (
                                <TableCell key={item.no} align="center" sx={{fontWeight:'bold'}}>{item.name}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {post.map((data) => (
                            <TableRow
                                hover
                                key={data.no}
                                sx={{
                                    '&:not(:last-child) td':{borderBottom:"2px solid #F6F6F6"}
                                }}
                            >
                                <TableCell align="center">{data.no}</TableCell>
                                <TableCell align="center"><StyledLink to={`/board/${data.no}`}>{data.title}</StyledLink></TableCell>
                                <TableCell align="center">{data.userId}</TableCell>
                                <TableCell align="center">{data.date}</TableCell>
                                <TableCell align="center">{data.hits}</TableCell>
                                <TableCell align="center">{data.up}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Table sx={{ minWidth: 650}} aria-label="simple table">
                    <TableHead sx={{background:'#F6F6F6',borderTop: "1px solid #ccc"}}>
                        <TableRow>
                            {theadTitle.map((item) => (
                                <TableCell key={item.no} align="center" sx={{fontWeight:'bold'}}>{item.name}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell align="center" colSpan={6}>등록된 글이 없습니다.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>)
            }
            </TableContainer>
        </>
    )
}