import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Container from '@mui/material/Container';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

export default function Upload({userId}) {

    // const [post, setPost] = useState({
    //     title:'',
    //     content:''
    // });
    const [check, setCheck] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const post = useSelector(state => ({
        title: state.title,
        content: state.content,
        userId: state.userId,
        flag: state.flag
    }));
    const imgLink = "http://localhost:5000/uploads";

    console.log('Upload 컴포넌트 post :: ',post);

    const customUploadAdapter = (loader) => {
        return {
            upload(){
                return new Promise ((resolve, reject) => {
                    const data = new FormData();
                    loader.file.then( (file) => {
                        data.append("name", file.name);
                        data.append("file", file);
                        console.log('data :: ',data);

                        axios.post(`${process.env.REACT_APP_URL}/uploadimg`, data)
                            .then((res) => {
                                console.log('res :: ',res);
                                if(!check){
                                    setCheck(true);
                                    console.log('res.data.filename :: ',res.data.filename);
                                }
                                resolve({
                                    default: `${imgLink}/${res.data.filename}`
                                });
                            })
                            .catch((err)=>reject(err));
                    })
                })
            }
        }
    }

    function uploadPlugin (editor){ 
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return customUploadAdapter(loader);
        }
    }

    const getTitle = e => {
        const { value } = e.target;
        dispatch({type:'TITLE_CHANGE',title:value});
    }

    const uploadForm = async() => {
        try {
            const result = await axios.post(`${process.env.REACT_APP_URL}/uploadPost`,post);
            alert(result.data.message);
            navigate('/articles',{replace:true});
        }catch(err) {
            console.log(err);
        }
    }

    const gotoList = () => {
        navigate('/articles');
    }

    return (
        <Container>
            <div>
                <h1>업로드</h1>
                <p>Upload 페이지</p>
                <input type="text" placeholder='title' name='title' onChange={getTitle}></input>
                <CKEditor
                        editor={ClassicEditor}
                        config={{
                            placeholder: '내용을 입력하세요.',
                            language: "ko",
                            extraPlugins: [uploadPlugin]
                        }}
                        onReady={(editor) => {
                            // You can store the "editor" and use when it is needed.
                            editor.editing.view.change((writer) => {
                                writer.setStyle(
                                    "height",
                                    "400px",
                                    editor.editing.view.document.getRoot()
                                );
                            });    
                            console.log('Editor is ready to use!');
                        }}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            // const imgSrcReg = /(<img[^>]*src\s*=\s*[^>]*>)/g;
                            // if(imgSrcReg.test(data)){
                            //     dispatch({type:'IMAGE_INSERT',flag:true});
                            // }
                            dispatch({type:'CONTENT_CHANGE',content:data});
                        }}
                        onBlur={(event, editor) => {
                            //에디터가 아닌 다른곳을 클릭했을 때
                            console.log('Blur');
                        }}
                        onFocus={(event, editor) => {
                            //에디터를 클릭했을 때
                            console.log('Focus');
                        }}
                />
                <button onClick={uploadForm}>업로드</button>
                <button onClick={gotoList}>이동</button>
            </div>
        </Container>
    );
}