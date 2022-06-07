>>>> Hướng dẫn chạy source code:
	1. Tại thư mục source được giải nén mở cmd bằng cách gõ cmd tại thanh đường dẫn thư mục
	2. Chạy câu lệnh "npm install" để tải thư mục node_modules
	3. Sau khi tải xong thư mục node_modules chạy câu lệnh "npm start" để chạy project
	4. Truy cập đường dẫn "http://localhost:3000"

>>>> Hướng dẫn import database (Điều kiện tải và cài đặt MongoDB Compass):
	1. Truy cập thư mục bin của MongoDB 
	2. Mở cmd bằng cách gõ cmd trên thanh đường dẫn thư mục
	3. Gõ lệnh: "mongorestore -d avat <đường dẫn tới thư mục avat trong thư mục 51900286_51900699_51900002_51900270>"
	+ Cách khắc phục lỗi: "mongorestore" is not recognized as an... 
	Mở trình duyệt truy cập đường dẫn "https://www.mongodb.com/try/download/database-tools" tải file .zip về. Sau đó giải nén, truy cập vào thư mục bin của thư mục vừa được giải nén và copy toàn bộ file .exe ở thư mục đó và paste ở thư mục bin của MongoDB. Thực hiện lại bước 2 để import database

>>>> Hướng dẫn đổi connect-string database:
	1. Tại thư mục source truy cập vào thư mục config/db trong đó có file index.js
	2. Ở phần connect dòng thứ 5 đổi chuỗi "mongodb+srv://avat:avat@advanced-web.v9bta.mongodb.net/AVAT" thành connect-string khác mong muốn
	3. Lưu file index.js
	
>>>> Hướng dẫn đổi email: 
	1. Tại thư mục source truy cập vào thư mục config/mail trong đó có file transporter.js
	2. Ở phần tạo transporter dòng thứ 11 đổi chuỗi "sinhvien@phongdaotao.com" thành email khác mong muốn
	3. Ở phần tạo transporter dòng thứ 12 đổi chuỗi "svtdtu" thành mật khẩu email mới đổi ở trên
	4. Lưu file transporter.js.

>>>> Video demo: https://www.youtube.com/watch?v=j6ZcDX95UUo

>>>> Các accounts trong database:
Trường Anh - SĐT: 0344883919
Tk: 7117210648
Mk: 123456
----------------------
Hoàng Vũ - SĐT: 0707318138
Tk: 4541185684
Mk: 123456
---------------------
Hoàng Vũ - SĐT: 0938972521
Tk: 6032182287
Mk: 123456
----------------------
Xuân Vinh - SĐT: 0909338741 (không chính xác)
Tk: 9252830849
Mk: dWcYqY
-----------------------
Quốc Đạt - SĐT: 0908972443 (không chính xác)
Tk: 2338471730
Mk: uuV1Uo
-----------------------
Thái An
Tk: 7586687796
Mk: HTpPtC
-----------------------
Admin
Tk: admin
Mk: 123456 

