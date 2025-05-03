import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null): string {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

export function formatFileSize(bytes: number | null | undefined): string {
    if (bytes === null || bytes === undefined) return "Unknown"

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (bytes === 0) return "0 Bytes"

    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    if (i === 0) return bytes + " " + sizes[i]

    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i]
}
