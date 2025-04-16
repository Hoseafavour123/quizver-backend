"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notfications_controller_1 = require("../controller/notfications.controller");
const router = (0, express_1.Router)();
router.put('/mark-as-read/:userId', notfications_controller_1.markAsRead);
router.get('/:userId', notfications_controller_1.getNotifications);
exports.default = router;
