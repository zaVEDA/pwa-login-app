// Единая дата официального запуска полной версии сервиса.
// Меняется в одном месте — везде, где упоминается дата запуска или действует
// связанное с ней ограничение (отсчёт тарифа, отправка документов по СМС),
// используется этот файл.
export const LAUNCH_DATE = new Date("2026-09-11T00:00:00");
export const LAUNCH_DATE_LABEL = "11 сентября 2026";
export const LAUNCH_DATE_SHORT = "11 сентября";

export const isBeforeLaunch = (): boolean => new Date() < LAUNCH_DATE;
