export interface SuccessResponse<T> {
    success: true;
    message: string;
    data?: T
};

export interface FailResponse {
    success: false;
    statusCode: number;
    message: string[]
};

export interface PaginationResponse<T> {
    success: true;
    pageInfo: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
    };
    data: T[];
}

export function buildSuccessResponse<T>(
    message: string,
    data?: T
): SuccessResponse<T>{
    return {
        success: true,
        message,
        ...(data ? { data } : {})
    };
}

export function buildFailResponse(
    statusCode: number,
    message: string[]
): FailResponse {
    return {
        success: false,
        statusCode,
        message
    };
}

export function buildPaginationResponse<T>(
    total: number,
    page: number,
    perPage: number,
    data: T[]
): PaginationResponse<T> {
    return {
        success: true,
        pageInfo: {
            totalItems: total,
            totalPages: Math.ceil(total / perPage),
            currentPage: page
        },
        data
    };
}