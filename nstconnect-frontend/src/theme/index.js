export const colors = {
    primary: '#0077B5', // LinkedIn Blue
    secondary: '#00A0DC',
    background: '#F3F2EF',
    white: '#FFFFFF',
    black: '#000000',
    text: '#191919',
    textSecondary: '#666666',
    border: '#E0E0E0',
    error: '#D32F2F',
    success: '#388E3C',
    gray: '#8C8C8C',
    lightGray: '#F9FAFB',
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
};

export const typography = {
    h1: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    h2: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    h3: { fontSize: 18, fontWeight: '600', color: colors.text },
    body: { fontSize: 16, color: colors.text },
    bodySmall: { fontSize: 14, color: colors.textSecondary },
    caption: { fontSize: 12, color: colors.textSecondary },
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
};
