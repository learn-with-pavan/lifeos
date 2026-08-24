const express = require("express");

const {
    create,
    getAll,
    getOne,
    update,
    remove,
} = require("../controllers/assetController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const router = express.Router();

router.use(authMiddleware);

router.post("/", authorizeRoles("CUSTOMER"), create);

router.get("/", authorizeRoles("CUSTOMER"), getAll);

router.get("/:id", authorizeRoles("CUSTOMER"), getOne);

router.put("/:id", authorizeRoles("CUSTOMER"), update);

router.delete("/:id", authorizeRoles("CUSTOMER"), remove);

module.exports = router;