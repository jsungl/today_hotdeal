import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

function Copyright() {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        {'Copyright © '}
        <Link color="#337ab7" href="https://mui.com/">
          Your Website
        </Link>
        {' '}
        {new Date().getFullYear()}
        {' All rights reserved.'}
      </Typography>
    );
}

export default function Footer() {
    //const description
    return (
        <Box component="footer">
            <Divider />
            <Copyright />
        </Box>
    );
}