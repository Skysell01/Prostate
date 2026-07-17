/**
 * Google Apps Script to handle form submissions and save to Google Sheet.
 * This script prevents saving duplicate entries with the same contact number.
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.google.com).
 * 2. Create a new spreadsheet or open an existing one.
 * 3. Go to "Extensions" > "Apps Script".
 * 4. Delete any code in the editor and paste this code.
 * 5. Click "Save" (disk icon).
 * 6. Click "Deploy" > "New deployment".
 * 7. Click the gear icon next to "Select type" and choose "Web app".
 * 8. Set Description to "Proman Form Webhook".
 * 9. Set "Execute as" to "Me (your-email@gmail.com)".
 * 10. Set "Who has access" to "Anyone". (This is important so the website can send data to it).
 * 11. Click "Deploy".
 * 12. Authorize permissions if prompted.
 * 13. Copy the "Web app URL" (Webhook URL) and save it in your .env file as `webhook=YOUR_URL`.
 */

function doPost(e) {
  var name = "";
  var phone = "";
  
  // 1. Try to parse parameters from URL Query string (e.parameter)
  if (e && e.parameter) {
    name = e.parameter.name || e.parameter.Name || e.parameter.NAME || name;
    phone = e.parameter.phone || e.parameter.Phone || e.parameter.PHONE || 
            e.parameter.contact || e.parameter.Contact || e.parameter.CONTACT || 
            e.parameter.number || e.parameter.Number || e.parameter.NUMBER || phone;
  }
  
  // 2. Try to parse JSON or form-urlencoded request body (e.postData)
  if (e && e.postData && e.postData.contents) {
    try {
      var data = JSON.parse(e.postData.contents);
      name = data.name || data.Name || data.NAME || name;
      phone = data.phone || data.Phone || data.PHONE || 
              data.contact || data.Contact || data.CONTACT || 
              data.number || data.Number || data.NUMBER || phone;
    } catch(err) {
      // Fallback if content is urlencoded
      try {
        var parts = e.postData.contents.split("&");
        for (var i = 0; i < parts.length; i++) {
          var pair = parts[i].split("=");
          var key = decodeURIComponent(pair[0]);
          var value = decodeURIComponent(pair[1] || "");
          if (["name", "Name", "NAME"].indexOf(key) !== -1) {
            name = value;
          } else if (["phone", "Phone", "PHONE", "contact", "Contact", "CONTACT", "number", "Number", "NUMBER"].indexOf(key) !== -1) {
            phone = value;
          }
        }
      } catch(e2) {
        // Ignore formatting errors
      }
    }
  }
  
  // Validate phone number input
  if (!phone) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: "Phone/Contact number is required." 
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Normalize fields
  name = name ? name.toString().trim() : "Unknown";
  phone = phone.toString().trim();
  
  // Access active spreadsheet and active sheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Initialize header row if sheet is brand new
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Name", "Contact Number"]);
  }
  
  // Read existing records to check for duplicates
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var isDuplicate = false;
  
  // Check if contact number already exists (excluding the header row)
  var newPhoneDigitsOnly = phone.replace(/\D/g, ""); // Strip non-digits for normalized comparison
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var existingPhone = row[2] ? row[2].toString().trim() : "";
    var existingPhoneDigitsOnly = existingPhone.replace(/\D/g, "");
    
    // Check if numbers match (both normalized or exact string check)
    if (
      (newPhoneDigitsOnly !== "" && existingPhoneDigitsOnly === newPhoneDigitsOnly) || 
      (existingPhone === phone)
    ) {
      isDuplicate = true;
      break;
    }
  }
  
  // If duplicate, do not save and return status
  if (isDuplicate) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "duplicate", 
      message: "Duplicate contact number. Data not saved." 
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // If not duplicate, append new row with timestamp, name, and phone
  var timestamp = new Date();
  sheet.appendRow([timestamp, name, phone]);
  
  return ContentService.createTextOutput(JSON.stringify({ 
    status: "success", 
    message: "Data saved successfully!" 
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET requests (optional, but good for testing or fallback methods)
 */
function doGet(e) {
  return doPost(e);
}
