const nodemailer = require("nodemailer");
const path = require('path');

if (process.env.NODE_ENV === 'production') {
    require("dotenv").config({ path: path.join(__dirname, '../.env.production') });
} else {
    require("dotenv").config({ path: path.join(__dirname, '../.env.development') });
}

//* csrf 방어 - referrer 검증
function chkReferer(referrer) {
    //* csrf 방어 - referrer 검증
    if(referrer === null || referrer !== 'http://15.164.144.146/') {
        return false;
    }else {
        return true;
    }
}

async function nodeMailer(info) {
    try {
        const { userId, token, email } = info;
    
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
            user: process.env.GMAIL_ID, // generated ethereal user
            pass: process.env.GMAIL_PASSWORD // generated ethereal password
            },
        });
        
        // send mail with defined transport object
        await transporter.sendMail({
            from: '핫딜 관리자', // 보내는 사람 메일 주소
            to: email, //요청 메일 주소
            subject: "아이디/비밀번호 정보입니다.", // 메일제목
            html: "<div><p>요청하신 계정 정보는 아래와 같습니다.</p><hr noshade>" + 
            `<ul><li>아이디 : ${userId}</li><li>이메일 주소 : ${email}</li></ul><hr noshade>` + 
            `<p>비밀번호 초기화를 위해 아래의 URL을 클릭하여 주세요.</p><a target="_blank" href="http://localhost:3000/user/reset?token=${token}&userId=${userId}">비밀번호 재설정 링크</a></div>`,
        });

        return true;

    }catch(err) {
        console.log(err);
        throw err;
    }

}

module.exports = {
    chkReferer: chkReferer,
    nodeMailer: nodeMailer,
}