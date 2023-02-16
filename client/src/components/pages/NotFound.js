import React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
//import { Link } from 'react-router-dom';

export default function NotFound() {

    return (
        <>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                width: "100%",
                height:"100%"
            }}>
                <div>
                    <Typography variant="h1" align="center">404</Typography>
                    <Typography variant="h5" align="center">
                        <Link href="/" underline="none" color="#000" sx={{"&:hover": {textDecoration: "none"}}}>
                            홈으로 이동
                        </Link>
                    </Typography>
                </div>
            </div>
        </>
    )
}