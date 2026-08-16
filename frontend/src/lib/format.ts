export const formatNumber = (value: unknown, maxDecimals = 2) => {
    const numberValue = Number(value ?? 0);
    if (!Number.isFinite(numberValue)) return '0';
    if (Number.isInteger(numberValue)) return String(numberValue);
    return numberValue.toFixed(maxDecimals);
};

export const formatPercent = (value: unknown, maxDecimals = 2) => `${formatNumber(value, maxDecimals)}%`;
