import express, { Express } from 'express'
import swaggerUi from 'swagger-ui-express'
import { createEntityRouter } from './app/router'
import swaggerDocument from './swagger.json'

const app: Express = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', createEntityRouter())

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  return res.status(500).json({
    errorName: err.name,
    message: err.message,
    stack: err.stack || 'no stack defined',
  })
})

export default app
