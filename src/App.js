import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ConversationsPage from "./pages/ConversationsPage";
import ChatPage from "./pages/ChatPage";
import { useAuth } from "./context/AuthContext";
const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    if (!token) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return children;
};
const App = () => {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(ConversationsPage, {}) }) }), _jsx(Route, { path: "/conversations/:conversationId", element: _jsx(ProtectedRoute, { children: _jsx(ChatPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
};
export default App;
