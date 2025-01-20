import { eitherTag } from '@matt.kantor/either-tag-symbol'

export type Either<LeftValue, RightValue> = Right<RightValue> | Left<LeftValue>

export type Left<Value> = {
  readonly [eitherTag]: 'left'
  readonly value: Value
}

export type Right<Value> = {
  readonly [eitherTag]: 'right'
  readonly value: Value
}

export const makeLeft = <const Value>(value: Value): Left<Value> => ({
  [eitherTag]: 'left',
  value,
})

export const makeRight = <const Value>(value: Value): Right<Value> => ({
  [eitherTag]: 'right',
  value,
})

export const match = <LeftValue, RightValue, LeftResult, RightResult>(
  adt: Either<LeftValue, RightValue>,
  cases: {
    readonly left: (value: LeftValue) => LeftResult
    readonly right: (value: RightValue) => RightResult
  },
): LeftResult | RightResult => {
  switch (adt[eitherTag]) {
    case 'left':
      return cases[adt[eitherTag]](adt.value)
    case 'right':
      return cases[adt[eitherTag]](adt.value)
  }
}
