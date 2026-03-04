import axios, { AxiosError } from 'axios';

type NormalizedError = { message: string; status: number; code?: string };

export function normalizeError(err: unknown): NormalizedError {
    if (axios.isAxiosError(err)) {
        const ax = err as AxiosError<any>;
        return {
            message: ax.response?.data?.message || ax.message,
            status: ax.response?.status || 500,
            code: ax.code,
        };
    }
    if (err instanceof Error) return { message: err.message, status: 500 };
    return { message: 'unexpected error', status: 500 };
}
