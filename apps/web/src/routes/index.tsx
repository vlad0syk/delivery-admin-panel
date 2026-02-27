import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "@/provider/authProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import AdminPage from "@/app/admin/AdminPage";
import LoginPage from "@/app/auth/LoginPage";

const Routes = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    const routesForAuthenticatedOnly = [
        {
          path: "/",
          element: <ProtectedRoute />,
          children: [
            {
              index: true,
              element: <Navigate to="/dashboard" replace />,
            },
            {
              path: "dashboard",
              element: <AdminPage />,
            },
          ],
        },
    ];

    const routesForNotAuthenticatedOnly = [
        {
          path: "/login",
          element: <LoginPage />,
        },
    ];

    const router = createBrowserRouter([
        ...routesForNotAuthenticatedOnly,
        ...(isAuthenticated ? routesForAuthenticatedOnly : []),
        {
          path: "*",
          element: <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />,
        },
    ]); 

    return <RouterProvider router={router} />;
}

export default Routes;