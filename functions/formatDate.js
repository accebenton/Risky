//format date for table rows

function getFormattedDate() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(2);

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12; // if 0, make it 12

  return `${hours}:${minutes}${ampm}, ${day}/${month}/${year}`;
}

module.exports = {
  getFormattedDate
};