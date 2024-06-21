
export const utcToist = (date: string | null | undefined) => {
    if (!date) return "";
    const dt = new Date(date + "Z");
    return dt.toLocaleString("en-CA", { timeZone: "Asia/Kolkata", hour12: false});
}