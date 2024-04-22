import Express from 'express';
const router = Express.Router();
import imageController from '../controllers/image'

router.get('/', imageController.getTest);
// Get image text:
router.post('/getText', imageController.getImageText);

export default router;