import fs from "node:fs";
import vm from "node:vm";

const schemaPath = new URL("../src/config/schema.gs", import.meta.url);
const source = fs.readFileSync(schemaPath, "utf8");

const context = {};
vm.createContext(context);
vm.runInContext(source, context, { filename: "schema.gs" });

const schema = context.REOS_SCHEMA;
const version = context.REOS_SCHEMA_VERSION;
const allowedTypes = new Set(context.REOS_TYPES || []);
const errors = [];

if (!version || typeof version !== "string") {
  errors.push("REOS_SCHEMA_VERSION is missing.");
}

if (!Array.isArray(schema) || schema.length === 0) {
  errors.push("REOS_SCHEMA must be a non-empty array.");
}

const tableMap = new Map();

for (const table of schema || []) {
  if (!table.name) {
    errors.push("A table is missing its name.");
    continue;
  }

  if (tableMap.has(table.name)) {
    errors.push(`Duplicate table: ${table.name}`);
  }

  tableMap.set(table.name, table);

  if (!Array.isArray(table.columns) || table.columns.length === 0) {
    errors.push(`${table.name}: columns must be a non-empty array.`);
    continue;
  }

  const keys = new Set();

  for (const column of table.columns) {
    if (!column.key) errors.push(`${table.name}: column without key.`);
    if (keys.has(column.key)) errors.push(`${table.name}: duplicate column ${column.key}.`);
    keys.add(column.key);

    if (!allowedTypes.has(column.type)) {
      errors.push(`${table.name}.${column.key}: unsupported type ${column.type}.`);
    }

    if (
      column.type === "ENUM" &&
      (!Array.isArray(column.enumValues) || column.enumValues.length === 0)
    ) {
      errors.push(`${table.name}.${column.key}: ENUM requires enumValues.`);
    }
  }

  if (table.primaryKey && !keys.has(table.primaryKey)) {
    errors.push(`${table.name}: primary key ${table.primaryKey} does not exist in columns.`);
  }
}

for (const table of schema || []) {
  for (const column of table.columns || []) {
    if (!column.foreignKey) continue;

    const [targetTableName, targetColumnKey] = column.foreignKey.split(".");
    const targetTable = tableMap.get(targetTableName);

    if (!targetTable) {
      errors.push(`${table.name}.${column.key}: missing FK table ${targetTableName}.`);
      continue;
    }

    const targetColumn = targetTable.columns.find(
      (item) => item.key === targetColumnKey
    );

    if (!targetColumn) {
      errors.push(
        `${table.name}.${column.key}: missing FK column ${column.foreignKey}.`
      );
    }
  }
}

if (errors.length) {
  console.error("Schema validation failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

const columnCount = schema.reduce(
  (sum, table) => sum + table.columns.length,
  0
);

console.log(
  `Schema OK — version ${version}, ${schema.length} tables, ${columnCount} columns.`
);
