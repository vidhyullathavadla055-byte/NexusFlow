import { scan, map, pairwise, filter } from "rxjs/operators";

/**
 * Rolling window average — backs the "Moving Average" node.
 * Keeps the last `windowSize` values and re-emits the average on every tick.
 */
export function rollingAverage( windowSize = 10 ) {
  return ( source$ ) =>
    source$.pipe(
      scan( ( buffer, value ) => {
        const next = [ ...buffer, value ];
        if ( next.length > windowSize ) next.shift();
        return next;
      }, [] ),
      map( ( buffer ) => buffer.reduce( ( sum, v ) => sum + v, 0 ) / buffer.length )
    );
}

/**
 * Threshold gate — backs "Threshold >" / "Threshold <" nodes.
 * Only lets a value through (i.e. the rule "fires") when the comparison holds.
 */
export function threshold( operator, boundary ) {
  const compare = operator === "Threshold <" ? ( v ) => v < boundary : ( v ) => v > boundary;
  return ( source$ ) => source$.pipe( filter( compare ) );
}

/**
 * Rate of change between consecutive readings — backs the "Derivative" node.
 * `window` is treated as the sampling gap in ticks for smoothing.
 */
export function derivative() {
  return ( source$ ) => source$.pipe( pairwise(), map( ( [ prev, curr ] ) => curr - prev ) );
}