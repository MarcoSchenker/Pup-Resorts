import "./App.css";

import { BrowserRouter as Router, Navigate,Route, Routes } from "react-router-dom";
import {ToastContainer} from "react-toastify";

import PrivateRoute from "./components/PrivateRoute/PrivateRoute.tsx";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import AddDog from "./pages/addDog";
import BookingEdit from "./pages/bookingEdit";
import BookingNew from "./pages/BookingNew";
import {MyBookings} from "./pages/bookings";
import EditDog from "./pages/editDog";
import UserEdit from "./pages/editUser";
import {Home} from "./pages/home";
import {LandingPage} from "./pages/landing";
import Login from "./pages/login";
import MyDogs from "./pages/myDogs";
import NotFound from "./pages/notFound";
import Register from "./pages/register";
import { isAuthenticated } from "./utils/auth";

function App() {
    return (
        <>
            <ToastContainer/>
            <Router>
                <Routes>
                    <Route
                        path="/"
                        element={
                            isAuthenticated()
                                ? <Navigate to="/home" replace />
                                : <LandingPage />
                        }
                    />

                    {/* Public */}

                    {<Route
                        path="/"
                        element={
                            <PublicRoute>
                                <LandingPage />
                            </PublicRoute>
                        }
                    />}

                    {<Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />}

                    {<Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />}

                    {/* Private */}
                    <Route
                        path="/home"
                        element={
                            <PrivateRoute>
                                    <Home />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/my_bookings"
                        element={
                            <PrivateRoute>
                                    <MyBookings />
                            </PrivateRoute>
                        }
                    />

                    {<Route
                        path="/booking/new"
                        element={
                            <PrivateRoute>
                                <BookingNew />
                            </PrivateRoute>
                        }
                    />}

                    {<Route
                        path="/booking/:id/edit"
                        element={
                            <PrivateRoute>
                                <BookingEdit />
                            </PrivateRoute>
                        }
                    />}

                    {<Route
                        path="/new_dog"
                        element={
                            <PrivateRoute>
                                <AddDog />
                            </PrivateRoute>
                        }
                    />}

                    {<Route
                        path="/edit_user"
                        element={
                            <PrivateRoute>
                                <UserEdit />
                            </PrivateRoute>
                        }
                    />}

                    {<Route
                        path="/my_dogs"
                        element={
                            <PrivateRoute>
                                <MyDogs />
                            </PrivateRoute>
                        }
                    />}

                    {<Route
                        path="/dog/edit/:id"
                        element={
                            <PrivateRoute>
                                <EditDog />
                            </PrivateRoute>
                        }
                    />}

                    {<Route path="/not_found" element={<NotFound />} />}

                    {/* For not defined routes -> Not Found */}
                    <Route path="*" element={<Navigate to="/not_found" replace />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
