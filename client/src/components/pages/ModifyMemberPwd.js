import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import styled from 'styled-components';


const InfoBox = styled.div`
    color: #777;
`;

export default function ModifyMemberPwd({isLogined, userId}) {
    const navigate = useNavigate();
    // const location = useLocation();
    const [passwordChk, setPasswordChk] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [rePassworddError, setRePasswordError] = useState('');
    // const isLogined = location.state.isLogined;
    // const userId = location.state.userId;
    console.log('[ModifyMemberPwd] isLogined: ',isLogined);
    console.log('[ModifyMemberPwd] userId: ',userId);

    const theme = createTheme({
        palette: {
          primary: {
            main: '#337ab7',
          },
        },
    });


    const onhandlePost = async(data) => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_URL}/user/modifyMemberPwd`, data);
            if(res.data.isModified){
                alert('비밀번호 변경 완료');
                navigate('/memberInfo',{replace:true});
            }

        }catch(err) {
            console.log(err);
            if(err.response.status === 301) {
                navigate('/',{ replace: true });
            }else {
                alert(err.response.data.message);
                !err.response.data.isModified && setPasswordChk('비밀번호를 다시 입력해주세요.');
            }
        }

    }

    const modifyMemberPassword = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const result = {
            userId,
            password: data.get('password'),
            newPassword: data.get('newPassword'),
            rePassword: data.get('rePassword')
        };
        const { newPassword, rePassword } = result;
        
        // 비밀번호 유효성 체크
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%*])(?=.*[0-9]).{8,12}$/;
        if (!passwordRegex.test(newPassword)) setNewPasswordError('올바른 비밀번호 형식이 아닙니다.');
        else setNewPasswordError('');

        // 비밀번호 같은지 체크
        if (newPassword !== rePassword) setRePasswordError('비밀번호가 일치하지 않습니다.');
        else setRePasswordError('');

        if (
            passwordRegex.test(newPassword) && 
            newPassword === rePassword &&
            isLogined
        ) {
            onhandlePost(result);
        }

    }

    return(
        <Box sx={{width:'100%'}}>
            <Typography variant="h6" sx={{ mb:2 }}>비밀번호 변경</Typography>
            <Box component="form" onSubmit={modifyMemberPassword}>
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
                                <TableCell sx={{background:"#f9f9f9"}}>
                                    <Typography>현재 비밀번호</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name="password" type="password" size="small" error={passwordChk !== ''} required/>
                                    <FormHelperText error>{passwordChk}</FormHelperText>
                                    <InfoBox>
                                        <span>정보 변경을 위해 현재 비밀번호를 입력하시길 바랍니다.</span>
                                    </InfoBox>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{background:"#f9f9f9"}}>
                                    <Typography>신규 비밀번호</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField name="newPassword" type="password" size="small" error={newPasswordError !== ''} required/>
                                    <FormHelperText error>{newPasswordError}</FormHelperText>
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
                                    <TextField name="rePassword" type="password" size="small" error={rePassworddError !== ''} required/>
                                    <FormHelperText error>{rePassworddError}</FormHelperText>
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
                        <Button variant="contained" size="small" onClick={()=>navigate(-1)}>취소</Button>
                    </ThemeProvider>
                </Stack>
            </Box>
        </Box>
    );
}