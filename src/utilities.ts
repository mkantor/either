import {
  makeLeft,
  makeRight,
  match,
  type Either,
  type Left,
  type Right,
} from './core.js'

export const flatMap = <LeftValue, RightValue, NewLeftValue, NewRightValue>(
  either: Either<LeftValue, RightValue>,
  f: (value: RightValue) => Either<NewLeftValue, NewRightValue>,
): Either<LeftValue | NewLeftValue, NewRightValue> =>
  match(either, {
    left: makeLeft,
    right: f,
  })

export const flatMapLeft = <LeftValue, RightValue, NewLeftValue, NewRightValue>(
  either: Either<LeftValue, RightValue>,
  f: (value: LeftValue) => Either<NewLeftValue, NewRightValue>,
): Either<NewLeftValue, RightValue | NewRightValue> =>
  match(either, {
    left: f,
    right: makeRight,
  })

export const isLeft = (
  either: Either<unknown, unknown>,
): either is Left<unknown> =>
  match(either, {
    left: _ => true,
    right: _ => false,
  })

export const isRight = (
  either: Either<unknown, unknown>,
): either is Right<unknown> =>
  match(either, {
    left: _ => false,
    right: _ => true,
  })

export const map = <LeftValue, RightValue, NewRightValue>(
  either: Either<LeftValue, RightValue>,
  f: (value: RightValue) => NewRightValue,
): Either<LeftValue, NewRightValue> =>
  match(either, {
    left: makeLeft,
    right: value => makeRight(f(value)),
  })

export const mapLeft = <LeftValue, RightValue, NewLeftValue>(
  either: Either<LeftValue, RightValue>,
  f: (value: LeftValue) => NewLeftValue,
): Either<NewLeftValue, RightValue> =>
  match(either, {
    left: value => makeLeft(f(value)),
    right: makeRight,
  })

/**
 * Transform an array of `Either`s into a `Right` containing an array, or a
 * `Left` containing the first `Left` value in `eithers`.
 */
export const sequence = <
  const Eithers extends readonly Either<unknown, unknown>[],
>(
  eithers: Eithers,
): SequenceOutput<Eithers> => {
  const firstEither = eithers[0]

  const returnValue =
    firstEither === undefined
      ? makeRight([])
      : eithers.reduce<
          // Unfortunately TypeScript doesn't keep track of the specific
          // left/right types in the `Eithers` type parameter—instead it falls
          // back to the concrete constraint types.
          Either<unknown, readonly unknown[]>
        >(
          (combinedEither, currentEither) =>
            flatMap(combinedEither, combinedValue =>
              map(currentEither, currentValue => [
                ...combinedValue,
                currentValue,
              ]),
            ),
          map(firstEither, value => [value]),
        )

  // The above `reduce` callback is guaranteed to produce an `Either` whose
  // `Right` type is an array of the same length as `Eithers`, but that's not
  // provable in TypeScript's type system.
  return returnValue as SequenceOutput<Eithers>
}
type SequenceOutput<Eithers extends readonly Either<unknown, unknown>[]> =
  Either<
    LeftValueOf<Eithers[number]>,
    ReduceNevers<{
      -readonly [Index in keyof Eithers]: RightValueOf<Eithers[Index]>
    }>
  > &
    unknown // Hide `SequenceOutput` from type info.

export const tryCatch = <RightValue>(
  operation: () => RightValue,
): Either<unknown, RightValue> => {
  try {
    return makeRight(operation())
  } catch (error) {
    return makeLeft(error)
  }
}

export const unwrapOrElse = <RightValue, FallbackValue, LeftValue>(
  either: Either<LeftValue, RightValue>,
  fallback: (value: LeftValue) => FallbackValue,
): RightValue | FallbackValue =>
  isRight(either) ? either.value : fallback(either.value)

export const unwrapLeftOrElse = <LeftValue, FallbackValue, RightValue>(
  either: Either<LeftValue, RightValue>,
  fallback: (value: RightValue) => FallbackValue,
): LeftValue | FallbackValue =>
  isLeft(either) ? either.value : fallback(either.value)

type RightValueOf<SpecificEither extends Either<unknown, unknown>> =
  SpecificEither extends Right<infer RightValue> ? RightValue : never

type LeftValueOf<SpecificEither extends Either<unknown, unknown>> =
  SpecificEither extends Left<infer LeftValue> ? LeftValue : never

/**
 * Convert uninhabited tuples to `never` (e.g. `[never]` becomes `never`).
 */
type ReduceNevers<Tuple extends readonly unknown[]> = Tuple extends Tuple // Distribute over unions.
  ? {
      [Index in keyof Tuple]: Tuple[Index] extends never ? unknown : never
    }[number] extends never
    ? Tuple
    : never
  : never
