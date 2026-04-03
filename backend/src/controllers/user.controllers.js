import userModel from "../models/user.models.js";
import jsonwebtoken from "jsonwebtoken";

export async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await userModel.create({ username, email, password });
    await user.save();

    const token = jsonwebtoken.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(401)
      .json({ message: "[register route]:-Error registering user" });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jsonwebtoken.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token);
    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(401).json({
      message: "[login route]:-Error logging in user",
    });
  }
}

export async function getUserProfile(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User profile fetched successfully",
      success: true,
      user: user,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(401)
      .json({ message: "[getUserProfile route]:-Error fetching user profile" });
  }
}
