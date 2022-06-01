module.exports = {
    checkAuth : (req, res, next) => {
        if(req.session.account) {
            next()
        }
        else {
            return res.redirect('/login')
        }
    },

    checkResetPassword : (req, res, next) => {
        if(!req.session.account.isChangeDefaultPassword) {
            return res.redirect('/reset-password')
        }
        next()
    },

    checkAuth2 : (req, res, next) => {
        if(!req.session.account)
            next()
        else {
            return res.redirect('/')
        }
    },
    
    checkAdmin : (req, res, next) => {
        if(req.session.account && req.session.account.isAdmin)
            next()
        else {
            return res.redirect('/login')
        }
    },

    checkAccountStatus : (req, res, next) => {
        if (req.session.account.status === 1) {
            next()
        } else {
            return res.redirect('/')
        }
    }
}