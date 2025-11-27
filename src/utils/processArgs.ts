function convertInput(value: any) {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
    if (lower === "null") return null;
    if (!isNaN(Number(value)) && value.trim() !== "") {
      return Number(value);
    }
  }
  return value;
}

export function processArgs(args: any) {
  const where: Record<string, any> = {};
  const orderBy: Record<string, string> = {};
  const select: Record<string, any> = {};

  const tempStorage: Record<string, any[]> = {};

  // Collect parameters into arrays where needed
  for (const key of Object.keys(args)) {
    if (key.startsWith("where[")) {
      const decodedKey = decodeURIComponent(
        key.replace(/\\\]/g, "]").replace(/\\\[/g, "[")
      );
      const field = decodedKey
        .substring(6, decodedKey.length - 1)
        .replace(/\]\[/g, ".");
      const value = args[key];
      if (!tempStorage[field]) {
        tempStorage[field] = [];
      }
      tempStorage[field].push(value);
    } else if (key.startsWith("orderBy[")) {
      const decodedKey = decodeURIComponent(
        key.replace(/\\\]/g, "]").replace(/\\\[/g, "[")
      );
      const field = decodedKey
        .substring(8, decodedKey.length - 1)
        .replace(/\]\[/g, ".");
      setNestedValue(orderBy, field, args[key] as string);
    } else if (key.startsWith("select[")) {
      const decodedKey = decodeURIComponent(
        key.replace(/\\\]/g, "]").replace(/\\\[/g, "[")
      );
      const field = decodedKey
        .substring(7, decodedKey.length - 1)
        .replace(/\]\[/g, ".");
      setNestedValue(select, field, args[key] === "true");
    }
  }

  // Process collected parameters into nested structure
  for (const field of Object.keys(tempStorage)) {
    const values = tempStorage[field];

    setNestedValue(
      where,
      field,
      values?.length === 1
        ? convertInput(values[0])
        : values?.map((v) => convertInput(v))
    );
  }

  const structuredData: any = {};
  if (Object.keys(where).length > 0) {
    structuredData.where = where;
  } else {
    structuredData.where = { ...where};
  }
  if (Object.keys(orderBy).length > 0) {
    structuredData.orderBy = orderBy;
  }
  if (typeof args.groupBy !== "undefined") {
    structuredData.groupBy = args.groupBy;
  }
  if (typeof args.language !== "undefined") {
    structuredData.language = args.language;
  }
  if (typeof args.skip !== "undefined") {
    structuredData.skip = args.skip;
  }
  if (typeof args.take !== "undefined") {
    structuredData.take = args.take;
  }
  if (Object.keys(select).length > 0) {
    structuredData.select = select;
  }

  // Ensure OR condition is an array of objects
  if (structuredData.where?.OR) {
    const orArray: any = structuredData.where.OR;
    structuredData.where.OR = [];
    for (const condition of Object.keys(orArray)) {
      const obj: any = orArray[condition];
      for (const key of Object.keys(obj)) {
        structuredData.where.OR.push({ [key]: convertInput(obj[key]) });
      }
    }
  }
  // Ensure AND condition is an array of objects
  if (structuredData.where?.AND) {
    const andArray: any = structuredData.where.AND;
    structuredData.where.AND = [];
    for (const condition of Object.keys(andArray)) {
      const obj: any = andArray[condition];
      for (const key of Object.keys(obj)) {
        structuredData.where.AND.push({ [key]: convertInput(obj[key]) });
      }
    }
  }

  return structuredData;
}

function setNestedValue(obj: Record<string, any>, path: string, value: any) {
  const keys = path.split(".");
  let currentObj = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isLastKey = i === keys.length - 1;
    if (!currentObj[key!] && !isLastKey) {
      currentObj[key!] = {};
    }

    if (isLastKey) {
      if (value === null || value === undefined) {
        currentObj[key!] = null;
      } else if (Array.isArray(currentObj[key!])) {
        currentObj[key!].push(value);
      } else if (key === "in") {
        // Ensure the value is always an array for 'in' key
        currentObj[key] = Array.isArray(value) ? value : [value];
        currentObj[key] = currentObj[key][0].split(",");
      } else if (
        typeof currentObj[key!] === "object" &&
        currentObj[key!] !== null &&
        "in" in currentObj[key!]
      ) {
        if (!Array.isArray(currentObj[key!].in)) {
          currentObj[key!].in.push([currentObj[key!].in]);
        }
        currentObj[key!].in.push(value);
      } else {
        currentObj[key!] = value;
      }
    } else {
      if (!currentObj[key!]) {
        currentObj[key!] = {};
      }
      currentObj = currentObj[key!];
    }
  }
}
