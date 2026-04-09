import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import chatReducer from "../features/chat/chat.slice";
import themeReducer from "../features/theme/theme.slice";
import accessReducer from "../features/access/access.slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    theme: themeReducer,
    access: accessReducer,
  },
});

export default store;
