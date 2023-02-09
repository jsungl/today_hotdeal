import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import styled from 'styled-components';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const InfoBox = styled.div`
    color: #777;
`;

export default function FindAccount() {

    console.log('=========FindAccount Component Rendering=========');
    const navigate = useNavigate();
    const [emailError, setEmailError] = useState('');
    const theme = createTheme({
        palette: {
          primary: {
            main: '#337ab7',
          },
        },
    });
    
    const onhandlePost = async(data) => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_URL}/user/findAccount`,{ email: data });
            let msg = data + ' 메일로 인증 정보를 담은 메일이 발송되었습니다. 메일이 보이지 않으면 스팸보관함을 열어보시길 바랍니다.';
            if(res.data.result) {
                alert(msg);
            }

        }catch(err) {
            console.error(err.response.data.message);
            if(err.response.status === 404) {
                alert(err.response.data.message);
                setEmailError('다시 입력해주세요');
            }else {
                alert('메일전송에 실패하였습니다');
            }
        }
    }

    const onFindAccount = (e) => {
        //아이디,비밀번호 찾기
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const userEmail = data.get('email');

        // 이메일 유효성 체크
        const emailRegex = /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
        if (!emailRegex.test(userEmail)) setEmailError('올바른 이메일 형식이 아닙니다.');
        else setEmailError('');

        if (emailRegex.test(userEmail)) {
            onhandlePost(userEmail);
            e.target.reset();
        }
    }

    return (
        <Container 
            maxWidth="md" 
            sx={{
                pt: 8,
                height: "100vh"
            }}
        >
            <Box 
                sx={{
                    mb: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: 'center'
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: '#337ab7' }}>
                    <LockOpenOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Find Account
                </Typography>
            </Box>
            <Box component="form" onSubmit={onFindAccount} sx={{mb:8}}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    align='center' 
                                    colSpan={2} 
                                    sx={{
                                        borderTop:'2px solid #444',
                                        borderBottom:'1px solid #888',
                                        fontWeight:'700'
                                    }}
                                >
                                    아이디/비밀번호 찾기
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{background:'#f9f9f9'}}>
                                    <Typography noWrap>이메일 주소</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name='email' size="small" error={emailError !== '' || false} required />
                                    <FormHelperText error>{emailError}</FormHelperText>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2} sx={{borderBottom:'1px solid #888'}}>
                                    <InfoBox>
                                        <span>가입할 때 등록하신 메일 주소를 입력하시고 "아이디/비밀번호 찾기" 버튼을 클릭해주세요.</span>
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
                        <Button type="submit" variant="contained" size="small">아이디/비번 찾기</Button>
                        <Button variant="contained" size="small" onClick={()=>navigate('/')}>취소</Button>
                    </ThemeProvider>
                </Stack>
            </Box>
            <Footer />
        </Container>

    );
}