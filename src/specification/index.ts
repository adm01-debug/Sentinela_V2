// Specification Pattern - Main Export
export * from "./specification";
export * from "./querySpecification";
export * from "./validationSpecification";
export * from "./specificationRepository";

import { spec, Specification } from "./specification";
import { FieldSpecification } from "./querySpecification";
import { RequiredFieldSpec, RangeSpec, PatternSpec, CompositeValidationSpec } from "./validationSpecification";

// Factory functions
export const createSpec = spec;
export const field = <T>(fieldName: string) => FieldSpecification.field<T>(fieldName);
export const required = <T>(field: keyof T, message?: string) => new RequiredFieldSpec<T>(field, message);
export const range = <T>(field: keyof T, min: number, max: number) => new RangeSpec<T>(field, min, max);
export const pattern = <T>(field: keyof T, regex: RegExp, message?: string) => new PatternSpec<T>(field, regex, message);
export const composite = <T>(...specs: import("./validationSpecification").ValidationSpecification<T>[]) => new CompositeValidationSpec<T>(specs);

// Email specification example
export const emailSpec = <T>(field: keyof T) => pattern<T>(field, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format");
