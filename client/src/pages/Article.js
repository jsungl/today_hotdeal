import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import DOMPurify from "dompurify";

const Article = () => {

    const {id} = useParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        async function func() {
            try{
                const result = await axios.get(`${process.env.REACT_APP_URL}/getPost?id=${id}`);
                setTitle(result.data[0].title);
                setContent(result.data[0].content);
            } catch(e) {
                console.error(e.message);
            }
        }
        func();
    },[id]);

    return (
        <div>
            <h2>게시글 번호 : {id}</h2>
            <h2>제목 : {title}</h2>
            <div dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(content)}}>
            </div>
        </div>
    );
};

export default Article;