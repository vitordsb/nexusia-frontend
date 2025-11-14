import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const AppHeader = ({ subtitle, actions }) => {
    return (_jsxs("header", { className: "topbar", children: [_jsxs("div", { children: [_jsx("div", { className: "topbar-brand", children: "Nexus AI" }), subtitle ? _jsx("div", { className: "subtitle", children: subtitle }) : null] }), _jsxs("div", { className: "topbar-actions", children: [_jsxs("span", { className: "topbar-status", children: [_jsx("span", { className: "status-dot" }), " Multi-IA ativo"] }), actions] })] }));
};
export default AppHeader;
