export const removeUnnecessaryChars = (text: string): string => {
    if (!text) return "";

    return text
        // Remove multiple spaces
        .replace(/\s+/g, ' ')
        // Remove multiple newlines (keep max 2)
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        // Remove zero-width characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Trim whitespace
        .trim();
};