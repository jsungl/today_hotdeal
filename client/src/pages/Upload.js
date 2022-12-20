import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import Container from '@mui/material/Container';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

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

    console.log('Upload 컴포넌트 post :: ',post);

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
            uploadUrl: `${process.env.REACT_APP_URL}/uploadimg/${userId}`

        }
    };

    const getTitle = e => {
        const { value } = e.target;
        dispatch({type:'TITLE_CHANGE',title:value});
        // setPost({
        //     ...post,
        //     [name]: value
        // })
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
                            const imgSrcReg = /(<img[^>]*src\s*=\s*[^>]*>)/g;
                            // while(imgSrcReg.test(data)) {
                            //     console.log('img 태그 :: ',RegExp.$1);
                            // }
                            if(imgSrcReg.test(data)){
                                dispatch({type:'IMAGE_INSERT',flag:true});
                            }
                            dispatch({type:'CONTENT_CHANGE',content:data});
                            //setPost({...post,content:data});
                            //console.log('change', post);
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