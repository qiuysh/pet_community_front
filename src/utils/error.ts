// front/src/utils/error.ts

export class AppError extends Error {
    constructor(
        public code: number,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const handleError = (error: unknown): string => {
    if (error instanceof AppError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
    if (error instanceof Error) {
        return error.message === 'Network error' || error.message === 'Request timeout';
    }
    return false;
};

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AppError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'An unexpected error occurred';
};