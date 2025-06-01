import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/calculator")({
	component: () => <Navigate to="/" />,
});
