import userModel from "../models/user.models.js";

export async function getUserById(userId) {
  try {
    const user = await userModel.findById(userId).select("-_id");
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return { success: true, user };
  } catch (error) {
    return { success: false, message: "Error fetching user" };
  }
}
