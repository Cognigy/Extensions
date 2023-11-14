
const addZero = (value) => value < 10 ? `0${value}` : value;

const getTodayDate = () => {
  const date = new Date();
  const currentDate = `${date.getFullYear()}${addZero(date.getMonth() + 1)}${addZero(date.getDate())}`;
  const currentTime = `${addZero(date.getHours())}${addZero(date.getMinutes())}${addZero(date.getSeconds())}`;
  return currentDate + currentTime
}

export default getTodayDate;