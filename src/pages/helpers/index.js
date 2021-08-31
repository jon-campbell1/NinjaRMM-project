const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

export const formatDeviceType = str => 
    str.split('_').map(substr => capitalizeFirstLetter(substr.toLowerCase())).join(' ')
