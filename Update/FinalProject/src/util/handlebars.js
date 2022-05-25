function registerHbs(hbs) {
    return hbs.create({
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
                    case 'deposit':
                        return 'Chuyển tiền'
                    case 'widraw':
                        return 'Rút tiền'
                }
            },
            switch: (value, options) => {
                this.switch_value = value;
                this.switch_break = false;
                return options.fn(this);
            },
            case: (value, options) => {
                if (value == this.switch_value) {
                    this.switch_break = true;
                    return options.fn(this);
                }
            },
        }
    })
}

module.exports = registerHbs