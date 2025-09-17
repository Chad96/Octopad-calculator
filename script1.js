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

// Curtain calculation formulas
function calcSheerOnSTrack(width, drop) {
  // WIDTH X 2.2M
  const making = (width * 2.2) / 1000; // in meters
  const fabric = making;
  return {
    making: making,
    fabric: fabric,
    track: width / 1000, // in meters
    installation: width / 1000, // in meters
  };
}

function calcSheerOnSTrackDropLong(width, drop) {
  // 200CM + 44 = 244CM; 244CM X 2 = 488CM; 488CM / 300CM = 1.6M (2M)
  // 3100MM + 300 = 3400MM; 3400MM X 2 = 6800MM (7M)
  const widthCm = width / 10;
  const dropMm = drop;
  const making = Math.ceil(((widthCm + 44) * 2) / 300); // round up to next meter
  const fabric = Math.ceil(((dropMm + 300) * 2) / 1000); // round up to next meter
  return {
    making: making,
    fabric: fabric * making,
    track: width / 1000,
    installation: width / 1000,
  };
}

function calcDrapeOnSTrack(width, drop) {
  // 300CM + 44CM = 344CM; 344CM X2 = 688CM; 688CM / 140CM = 4.9M (5M)
  // 2140MM + 300MM = 2440MM; 2440MM X 5M = 12.2M (13M)
  const widthCm = width / 10;
  const dropMm = drop;
  const making = Math.ceil(((widthCm + 44) * 2) / 140); // round up to next meter
  const fabric = Math.ceil(((dropMm + 300) * making) / 1000); // round up to next meter
  const lining = fabric;
  return {
    making: making,
    fabric: fabric,
    lining: lining,
    track: width / 1000,
    installation: width / 1000,
  };
}

function calcDrapeOnSilonTrack(width, drop) {
  // 2000MM + 450MM=2450MM; 2450MM X 2= 4900MM; 4900MM ÷ 700MM= 7 WIDTHS
  // 2700MM +300MM= 3000MM; 3000MM X 7 (WIDTHS)=21000MM (21M)
  const widths = Math.ceil(((width + 450) * 2) / 700);
  const fabric = Math.ceil(((drop + 300) * widths) / 1000);
  const lining = fabric;
  return {
    making: widths,
    fabric: fabric,
    lining: lining,
    track: width / 1000,
    installation: width / 1000,
  };
}

function calcSheerOnSilonTrackOrRod(width, drop) {
  // 2000MM X 2.5M=5000MM (5M)
  const making = (width * 2.5) / 1000;
  const fabric = making;
  return {
    making: making,
    fabric: fabric,
    track: width / 1000,
    installation: width / 1000,
  };
}

// Main calculation function
// Test harness for local testing
const isTest =
  typeof input === "undefined" || typeof input.config !== "function";
let testResults = [];

async function calculateCurtain(testConfig) {
  try {
    console.log("=== Starting Curtain Calculation ===");
    const config = isTest ? testConfig : input.config();
    console.log("Config object:", JSON.stringify(config, null, 2));
    let { width, drop, curtainType } = config;
    if (width === undefined || drop === undefined || !curtainType) {
      throw new Error("Missing required fields: width, drop, or curtainType.");
    }
    width = Number(width);
    drop = Number(drop);
    if (isNaN(width) || isNaN(drop)) {
      throw new Error("Width or drop is not a valid number.");
    }
    let result;
    switch (curtainType) {
      case "sheer_on_strack":
        result = calcSheerOnSTrack(width, drop);
        break;
      case "sheer_on_strack_long_drop":
        result = calcSheerOnSTrackDropLong(width, drop);
        break;
      case "drape_on_strack":
        result = calcDrapeOnSTrack(width, drop);
        break;
      case "drape_on_silon_track":
        result = calcDrapeOnSilonTrack(width, drop);
        break;
      case "sheer_on_silon_track_or_rod":
        result = calcSheerOnSilonTrackOrRod(width, drop);
        break;
      default:
        throw new Error("Unknown curtainType: " + curtainType);
    }
    // Set output variables
    if (!isTest) {
      Object.keys(result).forEach((key) => {
        output.set(key, result[key]);
      });
    }
    console.log("Calculation result:", result);
    if (isTest) testResults.push({ config, result });
    return result;
  } catch (error) {
    console.error("Error occurred during curtain calculation:", error);
    if (isTest) testResults.push({ config: testConfig, error: error.message });
    throw error;
  }
}

if (isTest) {
  // Sample test cases for each curtain type
  const testCases = [
    {
      width: 2000,
      drop: 2700,
      curtainType: "sheer_on_strack",
      description: "Sheer on S Track (2000mm x 2700mm)",
    },
    {
      width: 2000,
      drop: 3100,
      curtainType: "sheer_on_strack_long_drop",
      description: "Sheer on S Track with Drop > 3m (2000mm x 3100mm)",
    },
    {
      width: 3000,
      drop: 2140,
      curtainType: "drape_on_strack",
      description: "Drape on S Track (3000mm x 2140mm)",
    },
    {
      width: 2000,
      drop: 2700,
      curtainType: "drape_on_silon_track",
      description: "Drape on Silon Track (2000mm x 2700mm)",
    },
    {
      width: 2000,
      drop: 2700,
      curtainType: "sheer_on_silon_track_or_rod",
      description: "Sheer on Silon Track or Rod (2000mm x 2700mm)",
    },
  ];
  (async () => {
    for (const test of testCases) {
      console.log("\n--- Test: " + test.description + " ---");
      try {
        await calculateCurtain(test);
      } catch (e) {
        // Already logged
      }
    }
    console.log("\nAll test results:");
    testResults.forEach(({ config, result, error }) => {
      console.log("Test config:", config);
      if (result) {
        console.log("Result:", result);
      } else {
        console.log("Error:", error);
      }
      console.log("----------------------");
    });
  })();
} else {
  (async () => {
    try {
      let result = await calculateCurtain();
      console.log("Curtain Calculation Result:", result);
    } catch (err) {
      console.error("Calculation failed:", err);
    }
  })();
}
