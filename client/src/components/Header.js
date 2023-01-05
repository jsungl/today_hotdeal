import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import '../style/header.css'; //google web fonts

const customTheme = createTheme({
    palette: {
        primary: {
            main: '#337ab7',
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
        },
    },
});

export default function Header({target,keyword,setKeyword,setTarget,searchKeyword,searchText}) {
    const title = 'Hot Deal';
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const onChangeInput = (event) => {
        setKeyword(event.target.value);
    };

    const onChangeTarget = (event) => {
        setTarget(event.target.value);
    };

    const onClickSearchIcon = (event) => {
        setChecked((prev) => !prev);
    };

    const onClickLoginMenu = () => {
        setAnchorElUser(null);
        navigate('/login');
    }

    const onClickJoinMenu = () => {
        setAnchorElUser(null);
        navigate('/signUp');
    }

    return (
        <Box component="header">
            <ThemeProvider theme={customTheme}>
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar position="static" elevation={0}>
                        <Container maxWidth="xl">
                            {checked ? (
                                <Toolbar disableGutters={true}>
                                    <IconButton
                                        type="button"
                                        sx={{ p: '10px' }}
                                        onClick={onClickSearchIcon}
                                    >
                                        <ArrowBackIcon sx={{ fontSize: 30, color: '#fff' }} />
                                    </IconButton>
                                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                        <Paper
                                            component="form"
                                            sx={{
                                                p: '2px 4px',
                                                display: { xs: 'flex', sm: 'flex', md: 'none' },
                                                alignItems: 'center',
                                                width: '100%',
                                            }}
                                            onSubmit={searchKeyword}
                                        >
                                            <FormControl
                                                variant="standard"
                                                sx={{ ml: 1, minWidth: 130 }}
                                                size="small"
                                            >
                                                <Select
                                                    sx={{
                                                        '& .MuiSelect-select:focus': {
                                                            background: 'none',
                                                        },
                                                        '& .MuiSelect-select': {
                                                            paddingBottom: 0,
                                                        },
                                                    }}
                                                    value={target}
                                                    onChange={onChangeTarget}
                                                    disableUnderline
                                                >
                                                    <MenuItem value={'title_content'}>제목+내용</MenuItem>
                                                    <MenuItem value={'title'}>제목</MenuItem>
                                                    <MenuItem value={'content'}>내용</MenuItem>
                                                    <MenuItem value={'writer'}>글쓴이</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <TextField
                                                fullWidth
                                                name="search-keyword"
                                                placeholder="Search"
                                                type="search"
                                                variant="standard"
                                                InputProps={{ disableUnderline: true }}
                                                sx={{ ml: 1 }}
                                                onChange={onChangeInput}
                                                inputRef={searchText}
                                                value={keyword}
                                            />
                                            <IconButton type="submit" sx={{ p: '10px' }}>
                                                <SearchIcon />
                                            </IconButton>
                                        </Paper>
                                    </Box>
                                </Toolbar>
                            ) : (
                                <Toolbar
                                    disableGutters={true}
                                    sx={{
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        noWrap
                                        component="a"
                                        href="/"
                                        sx={{
                                            fontFamily: 'Anton',
                                            fontWeight: 400,
                                            letterSpacing: '.1rem',
                                            color: 'inherit',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        {title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Paper
                                            component="form"
                                            sx={{
                                                p: '2px 4px',
                                                display: { xs: 'none', sm: 'none', md: 'flex' },
                                                alignItems: 'center',
                                                width: 500,
                                            }}
                                            onSubmit={searchKeyword}
                                        >
                                            <FormControl
                                                variant="standard"
                                                sx={{ ml: 1, minWidth: 130 }}
                                                size="small"
                                            >
                                                <Select
                                                    sx={{
                                                        '& .MuiSelect-select:focus': {
                                                            background: 'none',
                                                        },
                                                        '& .MuiSelect-select': {
                                                            paddingBottom: 0,
                                                        },
                                                    }}
                                                    value={target}
                                                    onChange={onChangeTarget}
                                                    disableUnderline
                                                >
                                                    <MenuItem value={'title_content'}>제목+내용</MenuItem>
                                                    <MenuItem value={'title'}>제목</MenuItem>
                                                    <MenuItem value={'content'}>내용</MenuItem>
                                                    <MenuItem value={'writer'}>글쓴이</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <TextField
                                                fullWidth
                                                name="search-keyword"
                                                placeholder="Search"
                                                type="search"
                                                variant="standard"
                                                InputProps={{ disableUnderline: true }}
                                                sx={{ ml: 1 }}
                                                onChange={onChangeInput}
                                                inputRef={searchText}
                                                value={keyword}
                                            />
                                            <IconButton type="submit" sx={{ p: '10px' }}>
                                                <SearchIcon />
                                            </IconButton>
                                        </Paper>
                                    </Box>
                                    <Box sx={{display:'flex'}}>
                                        <IconButton
                                            size="medium"
                                            aria-haspopup="true"
                                            onClick={onClickSearchIcon}
                                            color="inherit"
                                            sx={{display: { xs: 'flex', sm: 'flex', md: 'none' }}}
                                        >
                                            <SearchIcon sx={{ fontSize: 30 }}/>
                                        </IconButton>

                                        <IconButton
                                            size="medium"
                                            aria-label="account of current user"
                                            aria-controls="menu-appbar"
                                            aria-haspopup="true"
                                            onClick={handleMenu}
                                            color="inherit"
                                        >
                                            <AccountCircle sx={{ fontSize: 30 }} />
                                        </IconButton>
                                        <Menu
                                            sx={{ mt: '45px' }}
                                            id="menu-appbar"
                                            anchorEl={anchorElUser}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'center',
                                            }}
                                            keepMounted
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'center',
                                            }}
                                            open={Boolean(anchorElUser)}
                                            onClose={handleCloseUserMenu}
                                        >
                                            <MenuItem key={'login'} onClick={onClickLoginMenu}>
                                                <Typography textAlign="center">로그인</Typography>
                                            </MenuItem>
                                            <MenuItem key={'join'} onClick={onClickJoinMenu}>
                                                <Typography textAlign="center">회원가입</Typography>
                                            </MenuItem>
                                        </Menu>
                                    </Box>
                                </Toolbar>
                            )}
                        </Container>
                    </AppBar>
                </Box>
            </ThemeProvider>
        </Box>
    );
}