import config from '../config.json'
import app from './server'

const port = Number(process.env.PORT || config.PORT || 8080)
app.listen(port, () => {
  console.info('Express application started on port: ' + port)
})
