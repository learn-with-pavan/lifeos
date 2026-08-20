const express = require("express");

const {
    create,
    getAll,
    getOne,
    update,
    remove,
} = require("../controllers/assetController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", create);

router.get("/", getAll);

router.get("/:id", getOne);

router.put("/:id", update);

router.delete("/:id", remove);

module.exports = router;