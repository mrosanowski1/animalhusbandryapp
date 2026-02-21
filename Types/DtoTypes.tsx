// TypeScript types that map to the C# `EnclosureDto` shape.
// Notes:
// - C# `Guid` -> string
// - C# `List<T>` -> T[]
// - C# DTO classes that are empty in the repo (AnimalDto, JobDto, CommentDto) are modeled as minimal/expandable shapes.
// - If your API returns camelCase JSON, use the camel-case variants below (or configure a JSON naming policy).

export interface CoordinateDTO {
  Longitude: number;
  Latitude: number;
}

/** Minimal placeholder for AnimalDto (expand with real properties when available) */
export interface AnimalDto {
  Id: string;
  Name?: string;
  // additional properties are allowed
  [key: string]: any;
}

/** Minimal placeholder for JobDto (expand with real properties when available) */
export interface JobDto {
  Id: string;
  Name?: string;
  [key: string]: any;
}

/** Minimal placeholder for CommentDto (expand with real properties when available) */
export interface CommentDto {
  // if comments are strings in C#, adjust to "string[]"
  Id?: string;
  Text?: string;
  [key: string]: any;
}

/** Matches the C# `EnclosureDto` (PascalCase properties) */
export interface EnclosureDto {
  Id: string;
  Name: string;
  Description: string;
  Animals: AnimalDto[];
  Coordinate: CoordinateDTO;
  Jobs: JobDto[];
  Comments: CommentDto[];
}