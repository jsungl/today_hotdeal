const db = require('../../config/db');

module.exports = {
    delRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE Member SET refresh_token=? WHERE user_id=?',[null,userId],(err,data)=>{ //refresh token 삭제
                if(err) reject(err);
                else resolve(true);
            });
        });
    }
};