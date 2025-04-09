"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = exports.getRefreshTokenCookieOptions = exports.getAccessTokenCookieOptions = exports.REFRESH_PATH = void 0;
const date_1 = require("./date");
exports.REFRESH_PATH = '/auth/refresh';
const defaults = {
    sameSite: 'none',
    httpOnly: true,
    secure: true,
};
const getAccessTokenCookieOptions = () => ({
    ...defaults,
    expires: (0, date_1.fifteenMinutesFromNow)(),
});
exports.getAccessTokenCookieOptions = getAccessTokenCookieOptions;
const getRefreshTokenCookieOptions = () => ({
    ...defaults,
    expires: (0, date_1.thirtyDaysFromNow)(),
    path: exports.REFRESH_PATH,
});
exports.getRefreshTokenCookieOptions = getRefreshTokenCookieOptions;
const setAuthCookies = ({ res, accessToken, refreshToken }) => res
    .cookie('accessToken', accessToken, (0, exports.getAccessTokenCookieOptions)())
    .cookie('refreshToken', refreshToken, (0, exports.getRefreshTokenCookieOptions)());
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res) => res
    .clearCookie('accessToken')
    .clearCookie('refreshToken', { path: exports.REFRESH_PATH });
exports.clearAuthCookies = clearAuthCookies;
