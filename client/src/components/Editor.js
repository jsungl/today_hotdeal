import { CKEditor } from '@ckeditor/ckeditor5-react';
//import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CustomEditor from 'ckeditor5-custom-build/build/ckeditor';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setPostContent, setPostFlag } from '../modules/posts';


export default function Editor({userId}) {
    const dispatch = useDispatch();

    //* 업로드 어댑터
    const customUploadAdapter = (loader) => {
        return {
            upload(){
                return new Promise ((resolve, reject) => {
                    
                    loader.file.then( async(file) => {
                        console.log('[Editor] file: ',file);
                        const name = file.name;
                        const filename = name.substring(0,name.indexOf('.'))+Date.now();
                        const type = name.substring(name.indexOf('.')+1);
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

    //* 업로드 플러그인
    function uploadPlugin (editor){ 
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return customUploadAdapter(loader);
        }
    }

    return (
        <CKEditor
            editor={CustomEditor}
            config={{
                placeholder: "내용을 입력하세요.",
                language: "ko",
                toolbar: [
                    "undo","redo","|",
                    "heading","|",
                    "bold","italic","underline","strikethrough","|",
                    "fontFamily","fontSize","fontColor","|",
                    "alignment","blockQuote","|",
                    "imageUpload"
                ],
                image: {
                    toolbar: [
                        "resizeImage",
                        "|",
                        "imageTextAlternative"
                    ],
                    resizeUnit: "%",
                    resizeOptions: [ 
                        {
                            name: "resizeImage:original",
                            value: null
                        },
                        {
                            name: "resizeImage:50",
                            value: "50"
                        },
                        {
                            name: "resizeImage:75",
                            value: "75"
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
            }}
            onChange={(event, editor) => {
                const data = editor.getData();
                dispatch(setPostContent(data));
            }}
        />
    );
}