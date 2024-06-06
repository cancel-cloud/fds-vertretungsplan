function generateDate(offset: number = 0): string {
    const now = new Date();
    now.setDate(now.getDate() + offset);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
}

export default generateDate;
