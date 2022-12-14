import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import Container from '@mui/material/Container';

export default function Upload() {
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
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
              "|",
              "imageTextAlternative",
            ],
            styles: ['inline', 'block', 'side'],
            type: ["JPEG", "JPG", "GIF", "PNG"],
        },
    };

    return (
        <Container>
            <div>
                <h1>업로드</h1>
                <p>Upload 페이지</p>
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
                            console.log('change', data);
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
            </div>
        </Container>
    );
}