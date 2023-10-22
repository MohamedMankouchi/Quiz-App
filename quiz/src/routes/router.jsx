import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Game } from "../pages/Game";
import { Error } from "../pages/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: ":id/:username",
    element: <Game />,
    errorElement: <Error />,
  },
]);

export default router;
