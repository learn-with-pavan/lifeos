const express = require("express");

const {
    create,
    getAll,
    getOne,
    update,
    remove,
    getHomeDetails,
} = require("../controllers/homeController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", create);

router.get("/", getAll);

router.get("/:homeId", getOne);

router.put("/:homeId", update);

router.delete("/:homeId", remove);

router.get("/:homeId/details", getHomeDetails);

module.exports = router;