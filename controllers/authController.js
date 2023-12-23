const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");


const googleSignUp = async (req, res) => {
  try {
    const { name, email } = req.body;

    let currUser = await User.findOne({ email });
    if (!currUser) {
      currUser = await User.create({
        name,
        email,
        password: "google",
      });
    }

    const accessToken = createAccessToken({ _id: currUser._id });
    const refreshToken = createRefreshToken({ _id: currUser._id });
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(201, { accessToken }));
  } catch (error) {}
};

const signUpController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      // res.status(403).send("Email and password required");
      return res.send(error(400, "All fields required"));
    }

    const currUser = await User.findOne({ email });
    if (currUser) {
      return res.send(error(409, "User already exists!"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // const newUser = new Users({password: hashedPassword, email})
    // const userData = await newUser.save();

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // res.status(200).send(`Successfully signed up ${userData}`)
    // res.status(201).json(newUser)

    const accessToken = createAccessToken({ _id: newUser._id });
    const refreshToken = createRefreshToken({ _id: newUser._id });
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(201, { accessToken }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      // res.status(403).send("Email and password required");
      res.send(error(403, "Email and password required"));
      return;
    }

    const currUser = await User.findOne({ email }).select("+password");

    if (!currUser) {
      res.send(error(404, "User not found"));
      return;
    }

    const matched = await bcrypt.compare(password, currUser.password);

    if (!matched) {
      return res.send(error(403, "Incorrect email or password"));
    }

    const accessToken = createAccessToken({ _id: currUser.id });
    const refreshToken = createRefreshToken({ _id: currUser.id });
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(201, { accessToken }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.send(error(401, "Refresh token required!"));
  }
  const refreshToken = cookies.jwt;

  try {
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    const _id = decode._id;
    const accessToken = createAccessToken({ _id });
    return res.send(success(200, { accessToken }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

function createAccessToken(data) {
  const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_KEY, {
    expiresIn: "1y",
  });
  return accessToken;
}
function createRefreshToken(data) {
  const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_KEY, {
    expiresIn: "1y",
  });
  return refreshToken;
}

const logOutController = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, "User logged out"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  loginController,
  signUpController,
  refreshAccessTokenController,
  logOutController,
  googleSignUp,
};
