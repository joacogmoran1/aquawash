export const sanitizeText = (value) =>
    String(value).replace(/\s+/g, " ").replace(/[<>]/g, "").trimStart();

export const sanitizeEmail = (value) =>
    String(value).toLowerCase().replace(/\s+/g, "").replace(/[<>]/g, "");

export const sanitizePhone = (value) =>
    String(value).replace(/[^\d+\-() ]/g, "").replace(/\s{2,}/g, " ").trimStart();

export const sanitizeInteger = (value) =>
    String(value).replace(/[^\d]/g, "");

export const sanitizeTime = (value) =>
    String(value).slice(0, 5);

export const sanitizePrice = (value) => {
    const cleaned = String(value).replace(",", ".").replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");

    if (parts.length <= 1) return cleaned;

    return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
};