import jwt, { Secret } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { accessTokenType } from "../interfaces/tokenTypes";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized request.");
  }

  const verifiedUser: accessTokenType = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as Secret
  ) as accessTokenType;

  req.user = verifiedUser;
  next();
});
