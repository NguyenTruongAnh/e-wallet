const siteRouter = require('./site')
const adminRouter = require('./admin')
const userRouter = require('./user')

function route(app) {
    app.use('/admin/', adminRouter)
    app.use('/', siteRouter, userRouter)

    app.use((req, res) => {
        res.status(404)
        res.render('404')
    })

    app.use((err, req, res, next) => {
        console.log(err.message)
        res.status(500)
        res.render('500')
    })
}

module.exports = route;
