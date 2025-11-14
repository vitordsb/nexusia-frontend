import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ConversationsPage from "./pages/ConversationsPage";
import ChatPage from "./pages/ChatPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { useAuth } from "./context/AuthContext";
const ProtectedRoute = ({ children }) => {
    const { token, isReady } = useAuth();
    if (!isReady) {
        return (_jsxs("div", { className: "app-loading", children: [_jsx("span", { className: "spinner", "aria-hidden": "true" }), " Validando sess\u00E3o..."] }));
    }
    if (!token) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return children;
};
const App = () => {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/esqueci-senha", element: _jsx(ForgotPasswordPage, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPasswordPage, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(ConversationsPage, {}) }) }), _jsx(Route, { path: "/conversations/:conversationId", element: _jsx(ProtectedRoute, { children: _jsx(ChatPage, {}) }) }), _jsx(Route, { path: "/assinaturas", element: _jsx(ProtectedRoute, { children: _jsx(SubscriptionsPage, {}) }) }), _jsx(Route, { path: "/perfil", element: _jsx(ProtectedRoute, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
};
export default App;
