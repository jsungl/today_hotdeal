import { useNavigate } from 'react-router-dom';
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
import { createTheme, ThemeProvider } from '@mui/material/styles';

const InfoBox = styled.div`
    color: #777;
`;

const theme = createTheme({
    palette: {
      primary: {
        main: '#337ab7',
      },
    },
});

export default function SignUp() {

    console.log('=========SignUp Component Rendering=========');

    const navigate = useNavigate();

    const onSignUpMember = (event) => {
        //회원가입
        event.preventDefault();
        console.log('[SignUp Component] Form Submit!');
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
                    alignItems: 'center'
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: '#337ab7' }}>
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
                                    align='center' 
                                    colSpan={2} 
                                    sx={{
                                        borderTop:'2px solid #444',
                                        borderBottom:'1px solid #888',
                                        fontWeight:'700'
                                    }}
                                >
                                    기본 정보
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{background:'#f9f9f9'}}>
                                    <Typography>아이디</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name='userId' size="small"/>
                                    <InfoBox>
                                        <span>사용자 ID는 3~20자 사이의 영문+숫자로 이루어져야 하며 영문으로 시작되어야 합니다.</span>
                                    </InfoBox>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{background:'#f9f9f9'}}>
                                    <Typography>비밀번호</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name='password1' type="password" size="small"/>
                                    <InfoBox>
                                        <span>비밀번호는 8~12자로 되어야 합니다.</span>
                                    </InfoBox>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component='th' scope='row' sx={{background:'#f9f9f9'}}>
                                    <Typography noWrap>비밀번호 확인</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name='password2' type="password" size="small"/>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{background:'#f9f9f9'}}>
                                    <Typography>닉네임</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name='nickname' size="small"/>
                                    <InfoBox>
                                        <span>닉네임은 2~8자 이내여야 합니다.</span>
                                    </InfoBox>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{background:'#f9f9f9',borderBottom:'1px solid #888'}}>
                                    <Typography noWrap>이메일 주소</Typography>
                                </TableCell>
                                <TableCell sx={{borderBottom:'1px solid #888'}}>
                                    <TextField name='email' size="small"/>
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