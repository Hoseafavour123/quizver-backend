"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessions_controller_1 = require("../controller/sessions.controller");
const router = (0, express_1.Router)();
router.get('/', sessions_controller_1.getSessionsHandler);
router.delete('/:id', sessions_controller_1.deleteSessionHandler);
exports.default = router;
