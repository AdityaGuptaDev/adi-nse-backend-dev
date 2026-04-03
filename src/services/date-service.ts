export const formatDate = (date: any, format: string = "") => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  if (format == "m-d-y") {
    return [month, year, day].join("-");
  } else if (format == "d-m-y") {
    return [day, month, year].join("-");
  } else if (format == "d-m") {
    return [day, month].join("-");
  } else if (format == "d/m/y") {
    return [day, month, year].join("/");
  } else {
    return [year, month, day].join("-");
  }
};

export const changeDateFormat = (date_string: string) => {
  let date_components: any[] = [];


  if (date_string.includes("/")) {
    date_components = date_string.split("/");
  } else if (date_string.includes("-")) {
    date_components = date_string.split("-");
  }

  var day: any = date_components[0];
  var month: any = date_components[1];
  var year: any = date_components[2];


  // return new Date(year, month - 1, day);
  return `${month}/${day}/${year}`;
};

export const countMonth = (date_string: string) => {

  // let date = changeDateFormat(date_string);
  var fullDate: any = new Date(date_string);
  let currDate = new Date();

  var months;
  months = (currDate.getFullYear() - fullDate.getFullYear()) * 12;
  months -= fullDate.getMonth();
  months += currDate.getMonth();
  return months <= 0 ? 0 : months;
};

//check date fromat : d/m//yy
export const checkValidDate = (date_string: string) => {
  var bits: any = date_string.split("/");
  var d = new Date(bits[2], bits[1] - 1, bits[0]);
  return d && d.getMonth() + 1 == bits[1];
};
