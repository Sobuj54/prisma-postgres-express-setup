import jwt, { Secret } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { accessTokenType } from "../modules/auth/auth.interface";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized request.");
  }

  const decodedToken: accessTokenType = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as Secret
  ) as accessTokenType;

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(403, "Forbidden");

  req.user = user;
  next();
});
