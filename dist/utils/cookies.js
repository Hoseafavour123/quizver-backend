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
// export const getRefreshTokenCookieOptions = (): CookieOptions => ({
//   ...defaults,
//   expires: thirtyDaysFromNow(),
//   path: REFRESH_PATH,
// })
const getRefreshTokenCookieOptions = (path = exports.REFRESH_PATH) => ({
    ...defaults,
    expires: (0, date_1.thirtyDaysFromNow)(),
    path,
});
exports.getRefreshTokenCookieOptions = getRefreshTokenCookieOptions;
const setAuthCookies = ({ res, accessToken, refreshToken, refreshPath = exports.REFRESH_PATH, }) => res
    .cookie('accessToken', accessToken, (0, exports.getAccessTokenCookieOptions)())
    .cookie('refreshToken', refreshToken, (0, exports.getRefreshTokenCookieOptions)(refreshPath));
exports.setAuthCookies = setAuthCookies;
// export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) =>
//   res
//     .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
//     .cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions())
const clearAuthCookies = (res, refreshPath) => res
    .clearCookie('accessToken')
    .clearCookie('refreshToken', { path: refreshPath });
exports.clearAuthCookies = clearAuthCookies;
