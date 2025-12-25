/**
 * Validation Benchmark
 */
import { validateObject, required, email, minLength } from '../src/core/validation';

function benchmark() {
  const iterations = 100000;
  const schema = {
    name: [required('name'), minLength('name', 2)],
    email: [required('email'), email('email')],
    password: [required('password'), minLength('password', 8)]
  };

  const validData = { name: 'John Doe', email: 'john@example.com', password: 'securepass123' };
  const invalidData = { name: 'J', email: 'invalid', password: '123' };

  // Valid data benchmark
  let start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    validateObject(validData, schema);
  }
  let end = process.hrtime.bigint();
  let durationMs = Number(end - start) / 1_000_000;
  console.log(`Valid data: ${Math.round(iterations / (durationMs / 1000)).toLocaleString()} validations/sec`);

  // Invalid data benchmark
  start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    validateObject(invalidData, schema);
  }
  end = process.hrtime.bigint();
  durationMs = Number(end - start) / 1_000_000;
  console.log(`Invalid data: ${Math.round(iterations / (durationMs / 1000)).toLocaleString()} validations/sec`);
}

benchmark();
