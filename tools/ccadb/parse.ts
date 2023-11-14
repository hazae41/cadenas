import * as Csv from "https://deno.land/std@0.202.0/csv/mod.ts";
import * as Path from "https://deno.land/std@0.206.0/path/mod.ts";

const directory = Path.dirname(new URL(import.meta.url).pathname)

const csv = Deno.readTextFileSync(`${directory}/ccadb.csv`)
const parsed = Csv.parse(csv, { skipFirstRow: true, strip: true })
const json = JSON.stringify(parsed)

Deno.writeTextFileSync(`${directory}/ccadb.json`, json)