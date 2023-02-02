const db = require('../config/db');

module.exports = {
    //* csrf 방어 - referrer 검증
    chkReferer: (referrer) => { 
        if(referrer === null || referrer !== 'http://localhost:3000/') {
            return false;
        }else {
            return true;
        }
    }








}