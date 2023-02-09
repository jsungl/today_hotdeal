import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLogout } from '../../modules/users';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export default function MemberLeave({isLogined, userId}) {
    // const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [passwordChk, setPasswordChk] = useState('');
    const [loading, setLoading] = useState(false);
    
    // const isLogined = location.state.isLogined;
    // const userId = location.state.userId;
    console.log('[MemberLeave] isLogined: ',isLogined);
    console.log('[MemberLeave] userId: ',userId);


    const theme = createTheme({
        palette: {
          primary: {
            main: '#337ab7',
          },
        },
    });

    const onConfirm = async(data) => {
        try {
            const prevResult = await axios.post(`${process.env.REACT_APP_URL}/user/prevLeaveMember`, data, {withCredentials: true});
            if(prevResult.data.result) {
                const deleteResult = await axios.delete(process.env.REACT_APP_DELETE_S3_POST_OBJECTS,{data:{userId}}); //S3 영구폴더에서 해당 유저 폴더 삭제
                if(deleteResult.status === 200) {
                    const res = await axios.post(`${process.env.REACT_APP_URL}/user/leaveMember`, data, {withCredentials: true});
                    if(res.data.result){
                        alert('탈퇴처리 되었습니다.');
                        dispatch(setLogout()); //로그아웃
                        setLoading(false);
                        navigate('/',{replace:true});
                    }
    
                }

            }
            
        }catch(err) {
            console.log(err);
            if(err.response.status === 301) {
                navigate('/',{ replace: true });
            }else if(err.response.status === 500) { //람다함수 실행 오류
                alert('Internal Server Error');
            }else {
                alert(err.response.data.message);
                !err.response.data.result && setPasswordChk('비밀번호를 다시 입력해주세요.');
            }
        }

    }

    const leaveMember = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const result = {
            userId,
            password: data.get('password')
        };
        if(isLogined) {
            if (window.confirm('정말 탈퇴하시겠습니까?')) {
                onConfirm(result);
                setLoading(true);
            }else {
                return;
            }
        }

    }

    return(
        <Box sx={{ width:'100%' }}>

            <Backdrop 
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <Typography variant="h6" sx={{ mb:2 }}>회원 탈퇴</Typography>
            <Alert severity="warning" sx={{ mb:2}}>
                탈퇴하는 경우 악용 방지를 위해 일정 기간 또는 영구적으로 가입시 사용했던 이메일을 이용한 재가입이 제한됩니다. 
            </Alert>
            <Box component="form" onSubmit={leaveMember}>
                <TableContainer>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ background:"#f9f9f9", borderTop:"2px solid #444", width:'10%', textAlign:'center' }}>
                                    <Typography>아이디</Typography>
                                </TableCell>
                                <TableCell sx={{ borderTop:"2px solid #444" }}>{userId}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ background:"#f9f9f9", textAlign:'center' }}>
                                    <Typography>비밀번호</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name="password" type="password" size="small" error={passwordChk !== ''} required/>
                                    <FormHelperText error>{passwordChk}</FormHelperText>
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
                        <Button type="submit" variant="contained" size="small">탈퇴</Button>
                        <Button variant="contained" size="small" onClick={()=>navigate(-1)}>돌아가기</Button>
                    </ThemeProvider>
                </Stack>
            </Box>
        </Box>
    );
}