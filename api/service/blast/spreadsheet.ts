import XLSX from "xlsx";
import { Customer } from "./model";

export function readSpreadsheet(filePath: string): Record<string, any>[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
  return data || [];
}

export async function syncSpreadsheetToDatabase(
  model: any,
  primaryKeyName: string,
  filePath: string
) {
  const result = {
    updated: 0,
    inserted: 0,
    error: "",
  };

  if (!(model && filePath && filePath)) {
    return { ...result, error: "model, fieldPK, filePath is required" };
  }

  const data = readSpreadsheet(filePath);

  if (data.length == 0) {
    return { ...result, error: "spreadsheet data is empty" };
  }

  const refKey: Record<string, string> = {};
  const attrs = model.getAttributes();

  for (const field in attrs) {
    for (const key in data[0]) {
      const patternField = new RegExp(
        [field, field.replace(/_/g, "-"), field.replace(/_/g, " ")].join("|"),
        "gi"
      );

      if (key.match(patternField)) {
        refKey[field] = key;
      }
    }
  }

  for (let i = 0; i < data.length; i++) {
    const primaryKeyValue = data[i]?.[refKey[primaryKeyName]];

    if (!primaryKeyValue) continue;

    // check current data
    const exist = await Customer.findOne({
      where: { [primaryKeyName]: primaryKeyValue },
      logging: false,
    });

    // create payload
    const payload: Record<string, any> = {};
    for (const field in refKey) {
      const value = data[i]?.[refKey[field]];
      if (typeof value == "string") {
        payload[field] = value.trim();
      } else {
        payload[field] = value;
      }
    }

    // update or insert data
    if (exist) {
      exist.set(payload);
      if (await exist.save()) {
        result.updated += 1;
      }
    } else {
      if (await model.create(payload, { logging: false })) {
        result.inserted += 1;
      }
    }
  }

  return result;
}
