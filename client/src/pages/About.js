import * as React from 'react';
import Box from '@mui/material/Box';
import axios from 'axios';


const About = () => {

    const imageUpload = async(event) => {
        event.preventDefault();
        console.log(event.target);
        await axios.post(`${process.env.REACT_APP_URL}/test`, event.target,{
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        })
        .then(res => console.log(res))
        .catch(err => console.log(err));
    }

    return (
        <div>
            <h1>소개</h1>
            <p>About 페이지</p>
            <Box component="form" onSubmit={imageUpload}>
                <input type="file" name="img"/>
                <input type="text" name="title"/>
                <button type="submit">submit</button>
            </Box>
        </div>
    );
};

export default About;