//import { useState } from 'react';


export default function BoardListFooter({onChangeAlign,align}) {

    //const [category, setCategory] = useState(0);

    return(
        <select
            className="form-select"
            value={align}
            onChange={(e)=>onChangeAlign(e.target.value)}
        >
            <option value='board_no'>최신순</option>
            <option value='hits'>조회순</option>
            <option value='up'>추천순</option>
            <option value='enroll_date'>오래된순</option>
        </select>

    );

}