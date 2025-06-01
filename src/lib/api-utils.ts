export function createJSONResponse(
	data: unknown,
	status = 200,
	headers?: HeadersInit,
) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	});
}

export function createErrorResponse(
	message: string,
	status = 500,
	field?: string,
) {
	const errorData: { message: string; field?: string } = { message };
	if (field) {
		errorData.field = field;
	}
	return createJSONResponse(errorData, status);
}
