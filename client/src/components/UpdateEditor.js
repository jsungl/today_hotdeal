import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from 'ckeditor5-custom-build/build/ckeditor';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setPostContent, setPostFlag } from '../modules/posts';

export default function UpdateEditor({userId,content}) {

    const dispatch = useDispatch();

    //const imgLink = "http://localhost:5000/uploads";

    //console.log('[UploadEditor Component] userId ::',userId);

    const customUploadAdapter = (loader) => {
        return {
            upload(){
                return new Promise ((resolve, reject) => {
                    
                    loader.file.then( async(file) => {
                        //console.log('[UploadEditor Component] file ::',file);
                        const originName = file.name;
                        const filename = originName.substring(0,originName.indexOf('.'))+Date.now();
                        const type = originName.substring(originName.indexOf('.')+1);
                        //const type = file.type.split("/")[1];
                        dispatch(setPostFlag(true));                         

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

    return (
        <CKEditor
            editor={CustomEditor}
            data={content}
            config={{
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
                        "resizeImage",
                        "|",
                        "imageTextAlternative"
                    ],
                    resizeUnit: "%",
                    resizeOptions: [ 
                        {
                            name: 'resizeImage:original',
                            value: null
                        },
                        {
                            name: 'resizeImage:50',
                            value: '50'
                        },
                        {
                            name: 'resizeImage:75',
                            value: '75'
                        }
                    ]
                },
                extraPlugins: [uploadPlugin]
            }}
            onReady={(editor) => {
                // You can store the "editor" and use when it is needed.
                editor.editing.view.change((writer) => {
                    writer.setStyle(
                        "height",
                        "500px",
                        editor.editing.view.document.getRoot()
                    );
                });    
                //console.log('Editor is ready to use!');
            }}
            onChange={(event, editor) => {
                const data = editor.getData();
                //dispatch({type:'CONTENT_CHANGE',content:data});
                dispatch(setPostContent(data));
            }}
            onBlur={(event, editor) => {
                //에디터가 아닌 다른곳을 클릭했을 때
                //console.log('Blur');
            }}
            onFocus={(event, editor) => {
                //에디터를 클릭했을 때
                //console.log('Focus');
            }}
        />
    );
}