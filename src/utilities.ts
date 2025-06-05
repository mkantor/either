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

export const tryCatch = <RightValue>(
  operation: () => RightValue,
): Either<unknown, RightValue> => {
  try {
    return makeRight(operation())
  } catch (error) {
    return makeLeft(error)
  }
}

export const unwrapOrElse = <RightValue, FallbackValue>(
  either: Either<unknown, RightValue>,
  fallback: () => FallbackValue,
): RightValue | FallbackValue => (isRight(either) ? either.value : fallback())

export const unwrapLeftOrElse = <LeftValue, FallbackValue>(
  either: Either<LeftValue, unknown>,
  fallback: () => FallbackValue,
): LeftValue | FallbackValue => (isLeft(either) ? either.value : fallback())
