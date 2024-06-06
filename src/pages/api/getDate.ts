function generateDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    //ADDED ONE DAY TO GET TOMORROW'S DATE
    const day = String(now.getDate() + 1).padStart(2, '0');

    return `${year}${month}${day}`;
}

export default generateDate;
