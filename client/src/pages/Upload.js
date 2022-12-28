import { CKEditor } from '@ckeditor/ckeditor5-react';
//import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CustomEditor from 'ckeditor5-custom-build/build/ckeditor';
import Container from '@mui/material/Container';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
// import dotenv from "dotenv";
// dotenv.config();

export default function Upload({userId}) {

    // const [post, setPost] = useState({
    //     title:'',
    //     content:''
    // });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const post = useSelector(state => ({
        title: state.title,
        content: state.content,
        userId: state.userId,
        flag: state.flag
    }));
    //const imgLink = "http://localhost:5000/uploads";

    console.log('Upload 컴포넌트 post :: ',post);

    const customUploadAdapter = (loader) => {
        return {
            upload(){
                return new Promise ((resolve, reject) => {
                    
                    loader.file.then( async(file) => {
                        console.log('file :: ',file);
                        const name = file.name;
                        const filename = name.substring(0,name.indexOf('.'))+Date.now();
                        const type = name.substring(name.indexOf('.')+1);
                        //const type = file.type.split("/")[1];                        

                        const bodyData = {
                            "objectKey": `temp/${userId}/${filename}.${type}`,
                            "s3Action": "putObject",
                            "contentType": file.type
                        }

                        const signedURL = await axios.post(
                            process.env.REACT_APP_GET_PRESIGNEDURL,
                            bodyData
                        )
                        .then(body => {
                            return body.data
                        })
                        .catch(error=>console.error(error));

                        await fetch(signedURL, {
                            method: "PUT",
                            body: file,
                            headers: {
                                "Content-Type": file.type,
                                "Access-Control-Allow-Origin":"*",
                                "Access-Control-Allow-Credentials":"true",
                            }
                        });
                        resolve({
                            default: `${process.env.REACT_APP_IMAGE_URL}/temp/${userId}/${filename}.${type}`
                        });    
                    })
                })
            },
            abort() {
                // Reject the promise returned from the upload() method.
                console.log('abort method called');
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
            //e.preventDefault();
            const result = await axios.post(`${process.env.REACT_APP_URL}/uploadPost`,post);
            const uploaded = result.data.uploaded;
            const postId = result.data.postId;
            if(!uploaded) {
                alert('upload error!');
            } else {
                const moveResult = await axios.put(process.env.REACT_APP_MOVE_S3_OBJECTS,{userId,postId});
                if(moveResult.status === 200){
                    const updateResult = await axios.post(`${process.env.REACT_APP_URL}/updateImagePath`,{
                        userId,
                        postId
                    });
                    console.log(updateResult.data.message);
                    alert('upload success!');
                    navigate('/articles',{replace:true});
                }
            }

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
                        editor={CustomEditor}
                        config={{
                            placeholder: '내용을 입력하세요.',
                            language: "ko",
                            toolbar: [
                                'undo','redo','|',
                                'heading','|',
                                'bold','italic','underline','strikethrough','|',
                                'fontFamily','fontSize','fontColor','|',
                                'alignment','blockQuote','|',
                                'imageUpload'],
                            image: {
                                toolbar: [
                                    "imageStyle:alignBlockLeft",
                                    "imageStyle:alignCenter",
                                    "imageStyle:alignBlockRight",
                                    "|",
                                    "imageTextAlternative",
                                ],
                                styles:["alignBlockLeft","alignBlockRight","alignCenter"]
                            },
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
                            const imgSrcReg = /(<img[^>]*src\s*=\s*[^>]*>)/g;
                            if(imgSrcReg.test(data)){
                                dispatch({type:'IMAGE_INSERT',flag:true});
                            }
                            const newContent = data.replaceAll('img','img style="width:100%"');
                            dispatch({type:'CONTENT_CHANGE',content:newContent});
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