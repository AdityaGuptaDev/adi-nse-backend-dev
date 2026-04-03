import configs from "../config/config";
import environment from "../environment";
import { USER_TYPE } from "./constant";
const config = (configs as { [key: string]: any })[environment];


export const getAdminLink = (url: string) => {
    return `${config.adminURL}/#/${url}`;
};

export const getCustomerLink = (url: string) => {
    return `${config.reactUrl}/${url}`;
};
export const sanitizePayload = (payload: any): any => {
    if (Array.isArray(payload)) {
        return payload.map(sanitizePayload);
    }

    if (payload !== null && typeof payload === 'object') {
        return Object.fromEntries(
            Object.entries(payload).map(
                ([key, value]) => [key, sanitizePayload(value)]
            )
        );
    }

    return payload === '' ? null : payload;
}

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
    } else if (format == "y-d-m") {
        return [year, day, month].join("-");
    } else if (format == "y-m-d") {
        return [year, month, day].join("-");
    } else {
        return [year, month, day].join("-");
    }
};

export const getRoundValue = (value: any, roundTo: any) => {
    var modValue = Math.round(value % roundTo);

    if (modValue == 0) {
        return value;
    }
    else {
        var result = (value - modValue) + roundTo;

        return result;
    }
}

export const getRoundOFValue = (value: any, roundTo: any, divd: any) => {
    var modValue = Math.round(value % roundTo);

    if (modValue == 0) {
        return value;
    } else if (modValue >= divd) {
        return (value - modValue) + roundTo;
    }
    else {
        return (value - modValue);
    }
}

export const toFixedData = (number: number) => {
    return number ? number?.toFixed(2) : 0;
};

export const convertToCrores = (number: number) => {
    const crore = 10000000;
    const crores = number / crore;
    return crores?.toFixed(2);
};

export const toFixedDataForReturn = (number: number) => {
    return number ? `${number?.toFixed(2)}%` : "--";
};


export const dateFormat = (date: any) => {
    var currentDate = new Date(date)
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = currentDate.getFullYear();
    return year + "-" + month + "-" + day;
}

export const isWeekend = (dateString: any) => {
    const date = new Date(dateString); // Convert the input string to a Date object
    const day = date.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)
    if (day == 0
        || day == 6) {
        return true;
    } else {
        return false;
    }
}

export const isLessThanOneDayAway = (expiryDateString: string | number | Date) => {
    const expiryDate = new Date(expiryDateString); // Convert string to Date object
    const now = new Date(); // Current date and time

    // Calculate the difference in milliseconds
    const differenceMs = expiryDate.getTime() - now.getTime();

    // Convert 1 day to milliseconds (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
    const oneDayInMs = 24 * 60 * 60 * 1000;

    // Check if the difference is greater than 0 (i.e., in the future)
    // AND less than one day
    return differenceMs > 0 && differenceMs < oneDayInMs;
}


//Added By rakesh sinha on dated 20-06-2025

export const generatedReference = (prefix: any) => {

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const serialStr = String(1).padStart(4, '0');
    return `${prefix}${dateStr}${serialStr}`;


}

export const convertDateDdMmYyyy = (data: any) => {
    const date = new Date(data);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;

}

export const calculateAge = (birthDate: any) => {
    const currentDate = new Date();
    const birth = new Date(birthDate);

    let age = currentDate.getFullYear() - birth.getFullYear();
    const isBeforeBirthdayThisYear =
        currentDate.getMonth() < birth.getMonth() ||
        (currentDate.getMonth() === birth.getMonth() && currentDate.getDate() < birth.getDate());

    if (isBeforeBirthdayThisYear) {
        age--;
    }
    return age;
}

export const getUserTypeFromID = (id: number) => {
    let ut = USER_TYPE;
    let keys = Object.keys(ut);
    let result = null;
    for (let key of keys) {
        //@ts-ignore
        if (ut[key] == id) {
            result = key;
        }
    }
    return result;
};

