"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catchErrors = (controller) => async (req, res, next) => {
    try {
        await controller(req, res, next);
    }
    catch (error) {
        next(error);
    }
};
exports.default = catchErrors;
