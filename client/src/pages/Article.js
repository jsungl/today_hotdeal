import { useParams } from "react-router-dom";

const Article = () => {

    const { id } = useParams();
    return (
        <div>
            <h2>게시글 {id}</h2>
            <div>
                <img className="Image" alt="image01" src="https://js-test-bucket-01.s3.ap-northeast-2.amazonaws.com/test1/placeimg_640_480_grayscale_animals.jpg" />
            </div>
        </div>
    );
};

export default Article;