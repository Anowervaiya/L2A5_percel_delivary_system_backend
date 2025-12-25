import { NextFunction, Response,Request } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { createUserTokens } from "../../utils/userTokens";
import AppError from "../../errorHelpers/appError";
import { setAuthCookie } from "../../utils/setCookie";
import { envVars } from "../../config/env";
import passport from "passport";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes'
import { JwtPayload } from "jsonwebtoken";
import { AuthServices } from "./auth.service";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  
  passport.authenticate('local', async (err: any, user: any, info: any) => {

    if (err) {
      console.log(err)
      return next(new AppError(401, err));
    }


    if (!user) {
      return next(new AppError(401, info.message));
    }

    const userTokens = await createUserTokens(user);

    setAuthCookie(res, userTokens);

    const { password: pass, ...rest } = user.toObject();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User Logged In Successfully',
      data: {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest,
      },
    });
  })(req, res, next);


})

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User Logged Out Successfully',
      data: null,
    });
  }
);

const gooleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user; //google set user in req.user auto
  if (!user) {
    throw new AppError(404, 'user not found');
  }
  const tokenInfo = createUserTokens(user);

  setAuthCookie(res, tokenInfo);

  res.redirect(envVars.FRONTEND_URL);
})

const setPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const { password } = req.body;

       await AuthServices.setPassword(decodedToken.userId, password);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Password Changed Successfully',
      data: null,
    });
  }
);


export const AuthConrollers = {
  gooleCallbackController,
  credentialsLogin,
  setPassword,
  logout,
};