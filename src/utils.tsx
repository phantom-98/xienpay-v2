import * as XLSX from 'xlsx/xlsx.mjs';
import { saveAs } from 'file-saver';

export const utcToist = (date: string | null | undefined) => {
    if (!date) return "";
    const dt = new Date(date + "Z");
    return dt.toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" });
}

export const validateRequest = (req: any) => {
    Object.keys(req).forEach(key => {
        if (!req[key]) {
          delete req[key];
        }
      });
    //uuid v 1-5 validation
    if (req.uuid && req.uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i) === null) {
        return 'Invalid UUID format';
    }
    if (req.id && !Number.isInteger(parseFloat(req.id))) {
        return 'ID should be integer'
    }
    if (req.amount && isNaN(req.amount)) {
        return 'Amount should be number'
    }
    return req;
}

export const downloadXLSX = (data: string, filename: string) => {
    const dataAsArray = data.split("\n").map(row => row.split(","));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dataAsArray);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const res = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer'});
    saveAs(new Blob([res]), filename);
}

export const downloadCSV = (data: string, filename: string) => {
    const blob = new Blob([data], { type: "text/csv"});
    saveAs(blob, filename);
}