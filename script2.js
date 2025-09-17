console.log("Script started.");

// This script uses separate inputs (csvHeaders and csvDataRows) rather than a CSV attachment.
// It assumes the following fixed CSV template:
//   Column 0: Width (with header "Width/Type (mm)")
//   Column 1: S TRACK TYPE 1 PRICE
//   Column 2: S TRACK TYPE 2 PRICE
//   Column 3: S TRACK TYPE 3 PRICE
//   Column 4: S TRACK TYPE 4 PRICE
//   Column 5: S TRACK TYPE 5 PRICE
//   Column 6: S TRACK TYPE 6 PRICE

async function calculateTrackPrice() {
  try {
    console.log("=== Starting Track Price Calculation ===");

    // Retrieve input configuration.
    console.log("Retrieving input configuration...");
    const config = input.config();
    console.log("Config object:", JSON.stringify(config, null, 2));

    let { trackWidth, csvHeaders, csvDataRows, selectedTrackTypeNumber } = config;

    // Validate and convert trackWidth.
    console.log("Validating trackWidth...");
    if (trackWidth === undefined || trackWidth === null) {
      throw new Error("Missing required field 'trackWidth'.");
    }
    const requiredWidth = Number(trackWidth);
    if (isNaN(requiredWidth)) {
      throw new Error("Provided trackWidth is not a valid number.");
    }
    console.log("Required track width (numeric):", requiredWidth);

    // Process csvHeaders.
    console.log("Processing CSV Headers...");
    let headers;
    // If csvHeaders is an array with one string element that looks like JSON, try to parse it.
    if (Array.isArray(csvHeaders)) {
      if (csvHeaders.length === 1 && typeof csvHeaders[0] === "string" && csvHeaders[0].trim().startsWith("[")) {
        console.log("csvHeaders appears to be a JSON-stringified array. Parsing it...");
        try {
          headers = JSON.parse(csvHeaders[0]);
          console.log("Parsed csvHeaders:", headers);
        } catch (e) {
          console.error("Error parsing csvHeaders JSON:", e);
          throw new Error("csvHeaders is not a valid JSON array.");
        }
      } else {
        headers = csvHeaders;
        console.log("csvHeaders is an array:", headers);
      }
    } else if (typeof csvHeaders === "string") {
      headers = csvHeaders.split(",").map(s => s.trim());
      console.log("csvHeaders string split into array:", headers);
    } else {
      throw new Error("csvHeaders must be provided as an array or a comma-separated string.");
    }

    // Process csvDataRows.
    console.log("Processing CSV Data Rows...");
    let dataRows;
    if (Array.isArray(csvDataRows)) {
      // Check if we have a single string that may be JSON-stringified.
      if (csvDataRows.length === 1 && typeof csvDataRows[0] === "string" && csvDataRows[0].trim().startsWith("[")) {
        console.log("csvDataRows appears to be a JSON-stringified array. Parsing it...");
        try {
          dataRows = JSON.parse(csvDataRows[0]);
          console.log("Parsed csvDataRows:", JSON.stringify(dataRows));
        } catch (e) {
          console.error("Error parsing csvDataRows JSON:", e);
          throw new Error("csvDataRows is not a valid JSON array.");
        }
      } else {
        dataRows = csvDataRows;
        console.log("csvDataRows is an array of rows:", JSON.stringify(dataRows));
      }
    } else if (typeof csvDataRows === "string") {
      // Assume rows are separated by newline characters.
      dataRows = csvDataRows.split("\n").map(line => line.split(",").map(s => s.trim()));
      console.log("csvDataRows string split into rows:", JSON.stringify(dataRows));
    } else {
      throw new Error("csvDataRows must be provided as an array of rows or as a newline-separated string.");
    }

    // Remove duplicate header row from data if present.
    console.log("Checking for duplicate header row in dataRows...");
    if (dataRows.length > 0 && dataRows[0][0] !== undefined) {
      const firstCell = dataRows[0][0].toLowerCase();
      const headerFirst = headers[0] ? headers[0].toLowerCase() : "";
      if (firstCell === headerFirst) {
        console.log("First row in dataRows appears to be a header; removing it.");
        dataRows = dataRows.slice(1);
      }
    }
    console.log("CSV Data Rows after header removal:", JSON.stringify(dataRows));

    // For this fixed template, width is always in column 0.
    const widthIndex = 0;
    console.log(`Using column index ${widthIndex} for width.`);

    // Determine the price column index based on selectedTrackTypeNumber.
    console.log("Determining selected track type and corresponding price column...");
    let trackType = 1;
    if (selectedTrackTypeNumber !== undefined) {
      const temp = Number(selectedTrackTypeNumber);
      if (!isNaN(temp) && temp >= 1 && temp <= 6) {
        trackType = temp;
      } else {
        console.warn("selectedTrackTypeNumber is invalid or out-of-range. Defaulting to 1.");
      }
    }
    // In this template, track type 1 uses column index 1, type 2 uses column index 2, etc.
    let desiredPriceIndex = trackType;
    // If the headers array doesn't have enough columns, fall back to the last available column.
    if (headers.length <= desiredPriceIndex) {
      console.warn(`CSV Headers do not include a column for track type ${trackType}. Falling back to the last available column (index ${headers.length - 1}).`);
      desiredPriceIndex = headers.length - 1;
    }
    console.log(`Using column index ${desiredPriceIndex} for price (track type ${trackType}).`);

    // Process each data row: convert width and price to numbers.
    console.log("Parsing data rows to extract options...");
    const options = [];
    dataRows.forEach((row, rowIndex) => {
      console.log(`Processing row ${rowIndex}:`, JSON.stringify(row));
      // Ensure the row has enough columns.
      if (row.length <= desiredPriceIndex) {
        console.warn(`Row ${rowIndex} does not have enough columns. Expected at least ${desiredPriceIndex + 1} columns.`);
        return;
      }
      const widthVal = parseFloat(row[widthIndex]);
      const priceVal = parseFloat(row[desiredPriceIndex]);
      console.log(`Row ${rowIndex} raw width: "${row[widthIndex]}" parsed as ${widthVal}`);
      console.log(`Row ${rowIndex} raw price: "${row[desiredPriceIndex]}" parsed as ${priceVal}`);
      if (!isNaN(widthVal) && !isNaN(priceVal)) {
        options.push({ width: widthVal, price: priceVal });
        console.log(`Row ${rowIndex} is valid and added to options.`);
      } else {
        console.warn(`Row ${rowIndex} is invalid due to non-numeric values.`);
      }
    });
    console.log("Extracted options array:", JSON.stringify(options));

    if (options.length === 0) {
      throw new Error("No valid pricing options found in the CSV data.");
    }

    // Sort options by width in ascending order.
    console.log("Sorting options by width in ascending order...");
    options.sort((a, b) => a.width - b.width);
    console.log("Sorted options:", JSON.stringify(options));

    // Select the smallest option with width >= requiredWidth.
    console.log("Selecting the smallest option with width >= requiredWidth...");
    let selectedOption = options.find(opt => opt.width >= requiredWidth);
    // If no option qualifies, choose the largest available option.
    if (!selectedOption) {
      console.log("No option found with width >= requiredWidth. Selecting the largest available option.");
      selectedOption = options[options.length - 1];
    }
    console.log(`Selected option: width = ${selectedOption.width} mm, price = $${selectedOption.price.toFixed(2)}`);

    // Set output variables.
    console.log("Setting output variables...");
    output.set("selectedTrackWidth", selectedOption.width);
    output.set("trackPrice", `$${selectedOption.price.toFixed(2)}`);

    console.log("=== Track Price Calculation Completed ===");
    return { selectedTrackWidth: selectedOption.width, trackPrice: `$${selectedOption.price.toFixed(2)}` };

  } catch (error) {
    console.error("Error occurred during track price calculation:", error);
    throw error;
  }
}

(async () => {
  try {
    let result = await calculateTrackPrice();
    console.log("Final Selected Track Width:", result.selectedTrackWidth);
    console.log("Final Track Price:", result.trackPrice);
  } catch (err) {
    console.error("Calculation failed:", err);
  }
})();
