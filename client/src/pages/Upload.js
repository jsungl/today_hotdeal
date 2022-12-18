import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import Container from '@mui/material/Container';
import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
    const [post, setPost] = useState({
        title:'',
        content:''
    });
    const config = {
        placeholder: '내용을 입력하세요.',
        language: "ko",
        toolbar:[
            'undo',
			'redo',
			'heading',
			'|',
			'bold',
			'italic',
			'underline',
			'fontFamily',
			'fontColor',
			'fontSize',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'|',
			'alignment',
			'outdent',
			'indent',
			'|',
			'imageInsert',
			'link'
            
        ],
        fontSize: {
            options: [
              14,
              16,
              18,
              20,
              22,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
            ],
        },
        alignment: {
            options: ["left", "center", "right"],
        },
        image: {
            resizeUnit: "px",
            toolbar: [
              "imageStyle:alignLeft",
              "imageStyle:alignCenter",
              "imageStyle:alignRight",
              "|",
              "imageTextAlternative",
            ],
            styles: ['alignLeft', 'alignRight','alignCenter'],
            types: ["jpeg", "jpg", "gif"],
        },
        simpleUpload: {
            uploadUrl: `${process.env.REACT_APP_URL}/uploadimg`

        }
    };

    const getTitle = e => {
        const { name, value } = e.target;
        setPost({
            ...post,
            [name]: value
        })
        console.log(post);
    }

    const uploadForm = async() => {
        await axios.post(`${process.env.REACT_APP_URL}/uploadPost`,post)
        .then(res => alert(res.data.message))
        .catch(err => console.log(err));

    }

    return (
        <Container>
            <div>
                <h1>업로드</h1>
                <p>Upload 페이지</p>
                <input type="text" placeholder='title' name='title' onChange={getTitle}></input>
                <CKEditor
                        editor={Editor}
                        config={config}
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
                            setPost({...post,content:data});
                            console.log('change', post);
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
            </div>
        </Container>
    );
}