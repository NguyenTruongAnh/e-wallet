const exphbs = require('express-handlebars');
function registerHbs() {
    return exphbs.create({
        extname: '.hbs',
        helpers: {
            sum: (a, b) => a + b,
            formatMoney: (a) => {
                const formatter = new Intl.NumberFormat('vi-VN')
                return formatter.format(a)
            },
            formatDate: (a) => {
                return new Date(a).toLocaleDateString('en-GB')
            },
            formatDateTime: (a) => {
                const d = new Date(a)
                return [d.getDate(),
                    d.getMonth()+1,
                    d.getFullYear()].join('/')+' '+
                   [d.getHours(),
                    d.getMinutes(),
                    d.getSeconds()].join(':');
            },
            formatId: (a) => {
                return a.valueOf().slice(0,10) + '...'
            },
            equal: (lvalue, rvalue, options) => {
                if (lvalue === rvalue) {
                    return options.fn(this)
                } else {
                    return options.inverse(this)
                }
            },
            formatStatus: (status) => {
                switch (status) {
                    case 0:
                        return 'Chờ kích hoạt'
                    case 1:
                        return 'Đã kích hoạt'
                    case 2:
                        return 'Yêu cầu bổ sung'
                    case 3:
                        return 'Vô hiệu hóa'
                }
            },
            formatType: (type) => {
                switch (type) {
                    case 0:
                        return 'Nạp tiền'
                    case 1:
                        return 'Rút tiền'
                    case 2:
                        return 'Chuyển tiền'
                    case 3:
                        return 'Mua thẻ điện thoại'
                }
            },
            ifWithObj: (a, b, obj, options) => {
                if(a === b)
                    return options.fn(obj)
                else
                    return options.inverse(obj)
            },
            switch: (value, options) => {
                this.switch_value = value;
                this.switch_break = false;
                return options.fn(this)
            },
            case: (value, options) => {
                if (value === this.switch_value) {
                    this.switch_break = true;
                    return options.fn(this);
                }
            },
            Each: (context, a, b, options) => {
                let ret = "";

                for (let i = 0, j = context.length; i < j; i++) {
                    let value = context[i]
                    context[i] = {
                        value,
                        name: a,
                        price: b
                    }
                    ret = ret + options.fn(context[i]);
                }

                return ret;
            }
        }
    })
}

module.exports = registerHbs