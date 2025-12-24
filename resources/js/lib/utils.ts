import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Memformat angka menjadi string mata uang Rupiah (IDR).
 * @param amount Jumlah angka yang akan diformat.
 * @returns String mata uang yang diformat (cth: "Rp 150.000").
 */
export function formatRupiah(amount: number | string) {
    const number = Number(amount);

    // Mengembalikan "Rp 0" jika input tidak valid
    if (isNaN(number)) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(0);
    }

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
}