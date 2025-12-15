const router = require('express').Router();
const EventController = require('../controllers/EventController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const eventController = new EventController();

router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);

router.post('/', protect, restrictTo('coach', 'admin'), eventController.create);
router.put('/:id', protect, restrictTo('coach', 'admin'), eventController.update);
router.delete('/:id', protect, restrictTo('coach', 'admin'), eventController.delete);

router.post('/:id/register', protect, eventController.register);
router.delete('/:id/register', protect, eventController.unregister);

router.get('/me/my-events', protect, eventController.getUserEvents);

router.get('/:id/registrations', protect, restrictTo('coach', 'admin'), eventController.getEventRegistrations);

module.exports = router;
