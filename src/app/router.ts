import { Router } from 'express'
import { Entity } from './entity'

export const createEntityRouter = () => {
  const router = Router()

  router.get('/entity/:id', async (req, res) => {
    res.send(`You requested ${req.params.id}`)
  })

  router.post('/entity', async (req, res) => {
    const entity: Entity = req.body
    res.status(200).send({
      data: `You posted ${JSON.stringify(entity)}`,
    })
  })

  return router
}
