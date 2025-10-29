import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const AppHeader = ({ subtitle }) => {
    const { logout, userId } = useAuth();
    return (_jsxs("header", { className: "header", children: [_jsxs("div", { children: [_jsx(Link, { to: "/", className: "header-title", children: "NexusAI Chat" }), subtitle ? _jsx("div", { className: "subtitle", children: subtitle }) : null] }), _jsxs("div", { className: "subtitle", children: [_jsxs("span", { style: { marginRight: "0.5rem" }, children: [_jsx("span", { className: "badge", children: "user" }), " ", userId] }), _jsx("button", { className: "btn btn-secondary", onClick: logout, children: "Sair" })] })] }));
};
export default AppHeader;
