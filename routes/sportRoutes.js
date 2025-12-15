const router = require('express').Router();
const SportController = require('../controllers/SportController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const sportController = new SportController();

router.get('/', sportController.getAll);
router.get('/:id', sportController.getById);

// only admin can create/update/delete sports
router.post('/', protect, restrictTo('admin'), sportController.create);
router.put('/:id', protect, restrictTo('admin'), sportController.update);
router.delete('/:id', protect, restrictTo('admin'), sportController.delete);

module.exports = router;
