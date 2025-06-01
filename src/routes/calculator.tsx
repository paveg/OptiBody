import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/calculator")({
	component: () => <Navigate to="/" />,
});
