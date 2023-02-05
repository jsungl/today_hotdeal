import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const InfoBox = styled.div`
    color: #777;
`;

export default function ResetAccount() {
    const [passwordState, setPasswordState] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [params] = useSearchParams();
    const token = params.get('token');
    const userId = params.get('userId');

    const theme = createTheme({
        palette: {
          primary: {
            main: '#337ab7',
          },
        },
    });

    const onhandlePost = async(data) => {
        console.log(data);
        try {
            const res = await axios.post(`${process.env.REACT_APP_URL}/user/resetPassword`,data);
            if(res.data.result) {
                alert('비밀번호가 변경되었습니다.');
            }
        }catch(err) {
            console.log(err);
            if(err.response.status === 401) {
                alert(err.response.data.message);
            }
        }

    }

    const onResetPassword = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const password = data.get('password');
        const rePassword = data.get('rePassword');

        // 비밀번호 유효성 체크
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%*])(?=.*[0-9]).{8,12}$/;
        if (!passwordRegex.test(password)) setPasswordState('올바른 비밀번호 형식이 아닙니다.');
        else setPasswordState('');

        // 비밀번호 같은지 체크
        if (password !== rePassword) setPasswordError('비밀번호가 일치하지 않습니다.');
        else setPasswordError('');

        const resetData = { token, userId, password, rePassword };


        if (
            passwordRegex.test(password) && 
            password === rePassword
        ) {
            onhandlePost(resetData);
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
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    비밀번호 재설정
                </Typography>
            </Box>
            <Box component="form" onSubmit={onResetPassword} sx={{mb:8}}>
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
                                    비밀번호 재설정
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
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
                                <TableCell component="th" scope="row" sx={{background:"#f9f9f9", borderBottom:"1px solid #888"}}>
                                    <Typography noWrap>비밀번호 확인</Typography>
                                </TableCell>
                                <TableCell sx={{ borderBottom:"1px solid #888" }}>
                                    <TextField name="rePassword" type="password" size="small" error={passwordError !== '' || false} required/>
                                    <FormHelperText error>{passwordError}</FormHelperText>
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
                    </ThemeProvider>
                </Stack>
            </Box>
            <Footer />
        </Container>

    );
}