import { useState, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MemberInfoHeader from '../MemberInfoHeader';





export default function MemberInfo() {
    const navigate = useNavigate();
    const isLogined = useSelector(state => state.userReducer.isLogined);
    const userId = useSelector(state => state.userReducer.userId);
    // console.log('[MemberInfo] isLogined :',isLogined);
    // console.log('[MemberInfo] userId :',userId);
    const [memberId, setMemberId] = useState('');
    const [memberName, setMemberName] = useState('');
    const [memberMail, setMemberMail] = useState('');
    const [joinDate, setJoinDate] = useState('');
    const [post, setPost] = useState([]);
    let userInfo = { id:userId, nickname:memberName, email:memberMail };

    useLayoutEffect(() => {
        async function getUserInfo() {
            try {
                const res = await axios.get(`${process.env.REACT_APP_URL}/user/getUserInfo`,{ params:{ userId } });
                if(res.data.success) {
                    setMemberId(res.data.userInfo.id);
                    setMemberName(res.data.userInfo.nickname);
                    setMemberMail(res.data.userInfo.email);
                    setJoinDate(res.data.userInfo.joinDate.substring(0,10));
                    setPost(res.data.post);
                }
            }catch(err) {
                console.log(err);
                err.response.status === 301 ? navigate('/',{ replace: true }) : console.log(err.response.data.message);
            }
        }

        isLogined && getUserInfo();

    },[isLogined,userId,navigate]);

    const handleModifyMember = () => {
        navigate('/modifyMemberInfo',{state: {isLogined, userInfo}});
    }

    const handleModifyPassword = () => {
        navigate('/modifyMemberPassword',{state: {isLogined, userId}});
    }

    const handleLeaveMember = () => {
        navigate('/memberLeave',{state: {isLogined, userId}});
    }


    return(
        <>
            <MemberInfoHeader index={0} info={{isLogined, userId}} post={post}/>
            <Box sx={{ mt: 5, mb: 10 }}>
                <Table aria-label="simple table" size="small">
                    <TableBody sx={{borderTop: "1px solid #ccc"}}>
                        <TableRow>
                            <TableCell component="th" sx={{background:"#F6F6F6", width:100, whiteSpace: "nowrap"}}>아이디</TableCell>
                            <TableCell>{memberId}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" sx={{background:"#F6F6F6", width:100}}>닉네임</TableCell>
                            <TableCell>{memberName}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" sx={{background:"#F6F6F6", width:100}}>이메일</TableCell>
                            <TableCell>{memberMail}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" sx={{background:"#F6F6F6", width:100}}>가입일</TableCell>
                            <TableCell>{joinDate}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
            <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
            >
                <Button variant="outlined" onClick={handleModifyMember}>회원정보 수정</Button>
                <Button variant="outlined" onClick={handleModifyPassword}>비밀번호 변경</Button>
                <Button variant="outlined" color="error" onClick={handleLeaveMember}>탈퇴</Button>
            </Stack>
        </>    
    )
}