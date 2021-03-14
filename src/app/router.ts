import { Router } from 'express'
import { Person } from './person'

export const createEntityRouter = () => {
  const router = Router()

  router.get('/person/:id', async (req, res) => {
    res.send(`You requested person ${req.params.id}`)
  })

  router.post('/person', async (req, res) => {
    const entity: Person = req.body
    res.status(200).send({
      data: `You posted person ${JSON.stringify(entity)}`,
    })
  })

  return router
}
