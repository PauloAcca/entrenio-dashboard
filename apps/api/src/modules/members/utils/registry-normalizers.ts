export const normDni = (v?: string | number | null) => {
    if (v === null || v === undefined) return null;
    const s = String(v).replace(/\D/g, '');
    return s.length ? s : null;
}

export const normEmail = (v?: string | null) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim().toLowerCase();
    return s.length ? s : null;
}

export const normStatus = (v?: string | null) => {
    const s = (v || '').toString().trim().toLowerCase();
    if (["active", "activo", "activa"].includes(s)) return 'active';
    if (["hold", "pausa", "susoendida", "suspendido"].includes(s)) return 'hold';
    if (["cancelled", "cancelado", "cancelada", "baja"].includes(s)) return 'cancelled';
    return 'active';
}

export const parseDate = (v?: any): Date | null => {
    if (!v && v !== 0) return null;

    if (typeof v === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const ms = v * 24 * 60 * 60 * 1000;
        return new Date(excelEpoch.getTime() + ms);
    }

    const str = String(v).trim();

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str + 'T00:00:00Z');

    // DD/MM/YYYY
    const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
        const [_, d, mm, y] = m;
        return new Date(`${y}-${mm.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00Z`);
    }

    // Fallback a Date nativa
    const dt = new Date(str);
    return isNaN(+dt) ? null : dt;
};
