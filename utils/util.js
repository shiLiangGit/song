const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//验证手机号;
const phone = (s) => {
  let regular = /1[0-9]{10,10}/;
  return regular.test(s);
}

//去左右空格;
const trimBlank = (s) => {
  let str = s.replace(/(^\s*)|(\s*$)/g, "");
  if (str == '') {
    return false;
  }
  return str;
}
module.exports = {
  formatTime: formatTime,
  phone:phone,
  trimBlank:trimBlank
}
