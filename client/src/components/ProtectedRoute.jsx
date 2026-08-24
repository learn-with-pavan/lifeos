import { Navigate, Outlet } from "react-router-dom";


const ProtectedRoute = ({
    children,
    allowedRoles = [],
}) => {

    const token =
        localStorage.getItem("token");


    const storedUser =
        localStorage.getItem("user");


    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    let user = null;


    try {

        user =
            storedUser
                ? JSON.parse(storedUser)
                : null;

    } catch (error) {

        console.error(
            "Unable to read stored user:",
            error
        );

        localStorage.removeItem(
            "user"
        );

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    /*
     * Authentication exists,
     * but user information is missing.
     */

    if (!user) {

        localStorage.removeItem(
            "token"
        );

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    /*
     * RBAC
     *
     * If no roles are specified,
     * any authenticated user can access.
     */

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(
            user.role
        )
    ) {

        /*
         * Send the user to the
         * correct application.
         */

        if (
            user.role === "PROVIDER"
        ) {

            return (
                <Navigate
                    to="/provider/requests"
                    replace
                />
            );
        }


        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }


    /*
     * Support both:
     *
     * <ProtectedRoute>
     *     <AppLayout />
     * </ProtectedRoute>
     *
     * and:
     *
     * <Route element={
     *     <ProtectedRoute />
     * }>
     *
     *     ...
     *
     * </Route>
     */

    if (children) {

        return children;

    }


    return <Outlet />;
};


export default ProtectedRoute;