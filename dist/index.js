"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const authUser_route_1 = __importDefault(require("./routes/authUser.route"));
const authAdmin_route_1 = __importDefault(require("./routes/authAdmin.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const quiz_route_1 = __importDefault(require("./routes/quiz.route"));
const payment_route_1 = __importDefault(require("./routes/payment.route"));
const session_route_1 = __importDefault(require("./routes/session.route"));
const db_1 = __importDefault(require("./config/db"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authenticate_1 = require("./middleware/authenticate");
const morgan_1 = __importDefault(require("morgan"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const http_1 = require("http");
const socket_1 = require("./sockets/socket"); //  Import the socket initializer
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 4004;
app.use((0, cors_1.default)({
    origin: process.env.APP_ORIGIN,
    credentials: true,
}));
const httpServer = (0, http_1.createServer)(app);
exports.io = (0, socket_1.initSocket)(httpServer); // ✅ Initialize Socket.io
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use('*', express_1.default.static(path_1.default.join(__dirname, '../../frontend/dist')));
app.use('/auth', authUser_route_1.default);
app.use('/auth/admin', authAdmin_route_1.default);
app.use('/user', authenticate_1.authenticate, user_route_1.default);
app.use('/admin', authenticate_1.authenticate, admin_route_1.default);
app.use('/sessions', authenticate_1.authenticate, session_route_1.default);
app.use('/quiz', authenticate_1.authenticate, quiz_route_1.default);
app.use('/payment', authenticate_1.authenticate, payment_route_1.default);
app.use(errorHandler_1.default);
app.use('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname + '/../../frontend/dist/index.html'));
});
httpServer.listen(port, async () => {
    console.log(`Server is running on http://localhost:${port}`);
    await (0, db_1.default)();
});
exports.default = app;
