import {Router} from 'express'
import { healthRoute } from './health-check'

export const apiRouters = Router()


apiRouters.use(healthRoute)