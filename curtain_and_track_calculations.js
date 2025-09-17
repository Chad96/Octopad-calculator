// Curtain calculation functions
function calcSheerOnSTrack(width, drop) {
  const making = (width * 2.2) / 1000;
  const fabric = making;
  return { making, fabric, track: width / 1000, installation: width / 1000 };
}
function calcSheerOnSTrackDropLong(width, drop) {
  const widthCm = width / 10;
  const dropMm = drop;
  const making = Math.ceil(((widthCm + 44) * 2) / 300);
  const fabric = Math.ceil(((dropMm + 300) * 2) / 1000);
  return { making, fabric: fabric * making, track: width / 1000, installation: width / 1000 };
}
function calcDrapeOnSTrack(width, drop) {
  const widthCm = width / 10;
  const dropMm = drop;
  const making = Math.ceil(((widthCm + 44) * 2) / 140);
  const fabric = Math.ceil(((dropMm + 300) * making) / 1000);
  const lining = fabric;
  return { making, fabric, lining, track: width / 1000, installation: width / 1000 };
}
function calcDrapeOnSilonTrack(width, drop) {
  const widths = Math.ceil(((width + 450) * 2) / 700);
  const fabric = Math.ceil(((drop + 300) * widths) / 1000);
  const lining = fabric;
  return { making: widths, fabric, lining, track: width / 1000, installation: width / 1000 };
}
function calcSheerOnSilonTrackOrRod(width, drop) {
  const making = (width * 2.5) / 1000;
  const fabric = making;
  return { making, fabric, track: width / 1000, installation: width / 1000 };
}

// Track price calculation for standard tracks
function calculateTrackPrice(trackWidth, csvHeaders, csvDataRows, trackTypeName) {
  let headers = typeof csvHeaders === 'string' ? csvHeaders.split(',').map(s => s.trim()) : csvHeaders;
  let dataRows = typeof csvDataRows === 'string' ? csvDataRows.split('\n').map(line => line.split(',').map(s => s.trim())) : csvDataRows;
  if (dataRows.length > 0 && dataRows[0][0].toLowerCase() === headers[0].toLowerCase()) dataRows = dataRows.slice(1);
  const widthIndex = 0;
  const desiredPriceIndex = headers.indexOf(trackTypeName);
  if (desiredPriceIndex === -1) throw new Error('Track type not found in headers');
  const options = [];
  dataRows.forEach(row => {
    if (row.length > desiredPriceIndex) {
      const widthVal = parseFloat(row[widthIndex]);
      const priceVal = parseFloat(row[desiredPriceIndex]);
      if (!isNaN(widthVal) && !isNaN(priceVal)) options.push({ width: widthVal, price: priceVal });
    }
  });
  if (options.length === 0) throw new Error('No valid pricing options found in the CSV data.');
  options.sort((a, b) => a.width - b.width);
  let selectedOption = options.find(opt => opt.width >= trackWidth);
  if (!selectedOption) selectedOption = options[options.length - 1];
  return { selectedTrackWidth: selectedOption.width, trackPrice: selectedOption.price };
}

// Track price calculation for motorized tracks
function calculateMotorizedTrackPrice(trackWidth, csvHeaders, csvDataRows, motorizedType) {
  let headers = typeof csvHeaders === 'string' ? csvHeaders.split(',').map(s => s.trim()) : csvHeaders;
  let dataRows = typeof csvDataRows === 'string' ? csvDataRows.split('\n').map(line => line.split(',').map(s => s.trim())) : csvDataRows;
  if (dataRows.length > 0 && dataRows[0][0].toLowerCase() === headers[0].toLowerCase()) dataRows = dataRows.slice(1);
  const widthIndex = 0;
  const desiredPriceIndex = headers.indexOf(motorizedType);
  if (desiredPriceIndex === -1) throw new Error('Motorized track type not found in headers');
  const options = [];
  dataRows.forEach(row => {
    if (row.length > desiredPriceIndex) {
      const widthVal = parseFloat(row[widthIndex]);
      const priceVal = parseFloat(row[desiredPriceIndex]);
      if (!isNaN(widthVal) && !isNaN(priceVal)) options.push({ width: widthVal, price: priceVal });
    }
  });
  if (options.length === 0) throw new Error('No valid pricing options found in the motorized CSV data.');
  options.sort((a, b) => a.width - b.width);
  let selectedOption = options.find(opt => opt.width >= trackWidth);
  if (!selectedOption) selectedOption = options[options.length - 1];
  return { selectedTrackWidth: selectedOption.width, trackPrice: selectedOption.price };
}

// Track price calculation for S-Fold Standard tracks
function calculateSfoldTrackPrice(trackWidth, csvHeaders, csvDataRows, sfoldType) {
  let headers = typeof csvHeaders === 'string' ? csvHeaders.split(',').map(s => s.trim()) : csvHeaders;
  let dataRows = typeof csvDataRows === 'string' ? csvDataRows.split('\n').map(line => line.split(',').map(s => s.trim())) : csvDataRows;
  if (dataRows.length > 0 && dataRows[0][0].toLowerCase() === headers[0].toLowerCase()) dataRows = dataRows.slice(1);
  const widthIndex = 0;
  const desiredPriceIndex = headers.indexOf(sfoldType);
  if (desiredPriceIndex === -1) throw new Error('S-Fold track type not found in headers');
  const options = [];
  dataRows.forEach(row => {
    if (row.length > desiredPriceIndex) {
      const widthVal = parseFloat(row[widthIndex]);
      const priceVal = parseFloat(row[desiredPriceIndex]);
      if (!isNaN(widthVal) && !isNaN(priceVal)) options.push({ width: widthVal, price: priceVal });
    }
  });
  if (options.length === 0) throw new Error('No valid pricing options found in the S-Fold CSV data.');
  options.sort((a, b) => a.width - b.width);
  let selectedOption = options.find(opt => opt.width >= trackWidth);
  if (!selectedOption) selectedOption = options[options.length - 1];
  return { selectedTrackWidth: selectedOption.width, trackPrice: selectedOption.price };
}
