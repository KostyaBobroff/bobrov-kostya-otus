export interface HttpResponse<T = any, E = any> {
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: E;
  };
}

export const createSuccessResponse = <T>(data: T): HttpResponse<T> => {
  return { data };
};

export const createErrorResponse = <E>(
  code: number,
  message: string,
  details?: E,
): HttpResponse<any, E> => {
  return { error: { code, message, details } };
};
