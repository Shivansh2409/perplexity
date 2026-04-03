import { createBrowserRouter } from "react-router";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Protect from "../features/auth/component/Protect";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protect>
        <div>home</div>
      </Protect>
    ),
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

//
