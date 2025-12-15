const router = require('express').Router();
const RoomController = require('../controllers/RoomController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const roomController = new RoomController();

router.get('/', roomController.getAll);
router.get('/:id', roomController.getById);

// only admin can manage rooms
router.post('/', protect, restrictTo('admin'), roomController.create);
router.put('/:id', protect, restrictTo('admin'), roomController.update);
router.delete('/:id', protect, restrictTo('admin'), roomController.delete);

module.exports = router;
