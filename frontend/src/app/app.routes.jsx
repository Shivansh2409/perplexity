import { createBrowserRouter } from "react-router";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Protect from "../features/auth/component/Protect";

// Legacy imports removed
import ChatLayout from "../features/chat/pages/ChatLayout";
import NewChatContent from "../features/chat/pages/NewChatContent";
import ChatContent from "../features/chat/pages/ChatContent";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protect>
        <ChatLayout />
      </Protect>
    ),
    children: [
      {
        index: true,
        element: <NewChatContent />,
      },
      {
        path: "chat/:chatId",
        element: <ChatContent />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
