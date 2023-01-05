import React from 'react';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Footer from '../Footer';

export default function Login() {

    console.log('=========Login Component Rendering=========');

    return (
        <Container 
            maxWidth="sm" 
            sx={{
               paddingTop:8
            }}>
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
                        Login
                    </Typography>
                    <Box>
                        <TextField
                            label="Email Address"
                            required
                            fullWidth
                            name="email"
                            autoComplete="email"
                            autoFocus
                            margin="normal"
                        />
                        <TextField
                            label="Password"
                            type="password"
                            required
                            fullWidth
                            name="password"
                            autoComplete="current-password"
                            margin="normal"
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            로그인
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link to='/findAccount'>아이디/비밀번호 찾기</Link>
                            </Grid>
                            <Grid item>
                                <Link to='/signUp'>계정이 없으신가요?회원가입</Link>
                            </Grid>
                        </Grid>
                    </Box>
            </Box>
            <Footer/>
        </Container>

    );
}