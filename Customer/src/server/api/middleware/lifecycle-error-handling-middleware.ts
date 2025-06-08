const lifeCycleErrorHandlingMiddleware = (error: Error) => {
  const name = error.name;
  switch (name) {
    case "NotFoundError":
      return new Response(null, {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
      break;
    case "UnauthorizedError":
      return new Response(null, {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
      break;
    case "ValidationError":
      return new Response(null, {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
      break;
    default:
      return new Response(null, {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
  }
};

export default lifeCycleErrorHandlingMiddleware;
