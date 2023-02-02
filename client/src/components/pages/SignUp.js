import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Footer from '../Footer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import GroupsIcon from '@mui/icons-material/Groups';
import styled from 'styled-components';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const InfoBox = styled.div`
    color: #777;
`;

export default function SignUp() {

    console.log('=========SignUp Component Rendering=========');
    const [idError, setIdError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordState, setPasswordState] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [nameError, setNameError] = useState('');
    const navigate = useNavigate();
    const { state } = useLocation();

    const theme = createTheme({
        palette: {
          primary: {
            main: '#337ab7',
          },
        },
    });

    //* 회원가입 요청
    const onhandlePost = async(data) => {
        const { userId, password, nickName, email } = data;
        const postData = {userId, password, nickName, email};

        await axios.post(`${process.env.REACT_APP_URL}/user/signUp`, postData)
        .then((res) => {
            if(res.data.isJoined){
                alert('회원가입 성공');
                if (state) {
                    navigate(state);
                } else {
                    navigate('/login');
                }
                
            }else {
                alert(res.data.message);
                res.data.duplication === "id" ? setIdError('') : setNameError('');
            }
        })
        .catch((err) => {
            console.log(err);
            alert('회원가입 실패');
        });
    }
    
    //* 유효성 검사
    const onSignUpMember = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const joinData = {
            userId: data.get('userId'),
            password: data.get('password'),
            rePassword: data.get('rePassword'),
            nickName: data.get('nickName'),
            email: data.get('email')
        };
        const {userId, password, rePassword, nickName, email} = joinData;
        
        // 아이디 유효성 체크
        const userIdRegex = /^(?=.*[0-9]+)[a-zA-Z][a-zA-Z0-9]{4,19}$/;
        if (!userIdRegex.test(userId)) setIdError('올바른 아이디 형식이 아닙니다.');
        else setIdError('');

        // 비밀번호 유효성 체크
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%*])(?=.*[0-9]).{8,12}$/;
        if (!passwordRegex.test(password)) setPasswordState('올바른 비밀번호 형식이 아닙니다.');
        else setPasswordState('');

        // 비밀번호 같은지 체크
        if (password !== rePassword) setPasswordError('비밀번호가 일치하지 않습니다.');
        else setPasswordError('');

        // 닉네임 유효성 검사
        const nameRegex = /^[가-힣a-zA-Z0-9]{2,8}$/;
        if (!nameRegex.test(nickName) || nickName.length < 1) setNameError('올바른 닉네임 형식이 아닙니다.');
        else setNameError('');

        // 이메일 유효성 체크
        const emailRegex = /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
        if (!emailRegex.test(email)) setEmailError('올바른 이메일 형식이 아닙니다.');
        else setEmailError('');

        if (
            userIdRegex.test(userId) && 
            passwordRegex.test(password) && 
            password === rePassword && 
            nameRegex.test(nickName) && 
            emailRegex.test(email)
        ) {
            onhandlePost(joinData);
        }
    }


    return (
        <Container 
            maxWidth="md" 
            sx={{
                paddingTop:8
            }}
        >
            <Box 
                sx={{
                    mb: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: "#337ab7" }}>
                    <GroupsIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign Up
                </Typography>
            </Box>
            <Box component="form" onSubmit={onSignUpMember}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    align="center" 
                                    colSpan={2} 
                                    sx={{
                                        borderTop:"2px solid #444",
                                        borderBottom:"1px solid #888",
                                        fontWeight:"700"
                                    }}
                                >
                                    기본 정보
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{background:"#f9f9f9"}}>
                                    <Typography>아이디</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name="userId" size="small" error={idError !== '' || false} required/>
                                    <FormHelperText error>{idError}</FormHelperText>
                                    <InfoBox>
                                        <span>사용자 ID는 5~20자 사이의 영문+숫자로 이루어져야 하며 영문으로 시작되어야 합니다.</span>
                                    </InfoBox>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{background:"#f9f9f9"}}>
                                    <Typography>비밀번호</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name="password" type="password" size="small" error={passwordState !== '' || false} required/>
                                    <FormHelperText error>{passwordState}</FormHelperText>
                                    <InfoBox>
                                        <span>비밀번호는 8~12자 사이의 영문+숫자로 이루어져야 하며 특수문자(!@#$%*)를 반드시 포함하여야 합니다.</span>
                                    </InfoBox>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row" sx={{background:"#f9f9f9"}}>
                                    <Typography noWrap>비밀번호 확인</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name="rePassword" type="password" size="small" error={passwordError !== '' || false} required/>
                                    <FormHelperText error>{passwordError}</FormHelperText>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{background:"#f9f9f9"}}>
                                    <Typography>닉네임</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name="nickName" size="small" error={nameError !== '' || false} required/>
                                    <FormHelperText error>{nameError}</FormHelperText>
                                    <InfoBox>
                                        <span>닉네임은 2~8자 이내여야 합니다.</span>
                                    </InfoBox>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{background:"#f9f9f9",borderBottom:"1px solid #888"}}>
                                    <Typography noWrap>이메일 주소</Typography>
                                </TableCell>
                                <TableCell sx={{borderBottom:"1px solid #888"}}>
                                    <TextField name="email" size="small" error={emailError !== '' || false} required/>
                                    <FormHelperText error>{emailError}</FormHelperText>
                                    <InfoBox>
                                        <span>메일주소는 메일인증 후 비밀번호 변경이나 찾기 등에 사용됩니다.</span>
                                    </InfoBox>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
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
            <Footer />
        </Container>
    );
}