const siteRouter = require('./site')

function route(app) {
  app.use('/', siteRouter)

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
