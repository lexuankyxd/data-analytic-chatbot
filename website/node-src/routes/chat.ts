import express from 'express'

const router = express.Router()

router.ws('/', (ws, req) => {
  ws.on('message', msg => {
    console.log(msg)
  })
})

export default router
