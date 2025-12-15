const router = require('express').Router();
const UserController = require('../controllers/UserController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const userController = new UserController();

router.get('/', protect, restrictTo('admin'), userController.getAll);
router.get('/:id', protect, userController.getById);
router.post('/', protect, restrictTo('admin'), userController.add);
router.put('/:id', protect, restrictTo('admin'), userController.update);
router.delete('/:id', protect, restrictTo('admin'), userController.delete);

module.exports = router;
