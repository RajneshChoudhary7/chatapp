import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const getToken = (userId) => {
  try {
    const token = jwt.sign(
      { userId },                 // payload
      process.env.JWT_SECRET,     // secret key
      { expiresIn: "7d" }         // options
    );

    return token;
  } catch (error) {
    console.log("Error in generating token =", error.message);
  }
};

export default getToken;
