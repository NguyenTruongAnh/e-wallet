// Email handler
const nodemailer = require('nodemailer')

// Nodemailer stuff

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     host: "mail.phongdaotao.com",
//     port: 25,
//     secure: false, 
//     auth: {
//         user: "sinhvien@phongdaotao.com",
//         pass: "svtdtu",
//     },
//     tls: { rejectUnauthorized: false },
// });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "truonganhvnbd1999@gmail.com",
    port: 25,
    secure: false,
    auth: {
        user: "truonganhvnbd1999@gmail.com",
        pass: "nguyentruonganh"
    },
    tls: {
        rejectUnauthorized: false
    }
})

transporter.verify((error, success) => {
    if (error) {
        console.log('Can not connect to gmail')
    } else {
        console.log('Ready for send email')
    }
})



module.exports = transporter