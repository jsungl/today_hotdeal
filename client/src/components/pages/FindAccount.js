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
import styled from 'styled-components';
import Stack from '@mui/material/Stack';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
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

export default function FindAccount() {

    console.log('=========FindAccount Component Rendering=========');

    const navigate = useNavigate();

    const onFindAccount = (event) => {
        //아이디,비밀번호 찾기
        event.preventDefault();
        console.log('[FindAccount Component] Form Submit!');
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
                    <LockOpenOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Find Account
                </Typography>
            </Box>
            <Box component="form" onSubmit={onFindAccount}>
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
                                    <TextField name='findAccountEmail' size="small"/>
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