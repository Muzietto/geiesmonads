define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Maybe = Maybe;
  // Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
  //
  // Permission is hereby granted, free of charge, to any person
  // obtaining a copy of this software and associated documentation files
  // (the "Software"), to deal in the Software without restriction,
  // including without limitation the rights to use, copy, modify, merge,
  // publish, distribute, sublicense, and/or sell copies of the Software,
  // and to permit persons to whom the Software is furnished to do so,
  // subject to the following conditions:
  //
  // The above copyright notice and this permission notice shall be
  // included in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  // EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  // NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  // LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  // OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  /**
   * @module lib/maybe
   */
  // module.exports = Maybe

  // -- Aliases ----------------------------------------------------------
  var clone = Object.create;
  function unimplemented() {
    throw new Error('Not implemented.');
  }
  function noop() {
    return this;
  }

  // -- Implementation ---------------------------------------------------

  /**
   * A structure for values that may not be present, or computations that may
   * fail. `Maybe(a)` explicitly models the effects that are implicit in
   * `Nullable` types, thus has none of the problems associated with
   * `null` or `undefined` — like `NullPointerExceptions`.
   *
   * The class models two different cases:
   *
   *  + `Just a` — represents a `Maybe(a)` that contains a value. `a` may
   *     be any value, including `null` or `undefined`.
   *
   *  + `Nothing` — represents a `Maybe(a)` that has no values. Or a
   *     failure that needs no additional information.
   *
   * Common uses of this structure includes modelling values that may or may
   * not be present in a collection, thus instead of needing a
   * `collection.has(a)`, the `collection.get(a)` operation gives you all
   * the information you need — `collection.get(a).is-nothing` being
   * equivalent to `collection.has(a)`; Similarly the same reasoning may
   * be applied to computations that may fail to provide a value, e.g.:
   * `collection.find(predicate)` can safely return a `Maybe(a)` instance,
   * even if the collection contains nullable values.
   *
   * Furthermore, the values of `Maybe(a)` can be combined and manipulated
   * by using the expressive monadic operations. This allows safely
   * sequencing operations that may fail, and safely composing values that
   * you don't know whether they're present or not, failing early
   * (returning a `Nothing`) if any of the operations fail.
   *
   * If one wants to store additional information about failures, the
   * [Either][] and [Validation][] structures provide such a capability, and
   * should be used instead of the `Maybe(a)` structure.
   *
   * [Either]: https://github.com/folktale/data.either
   * [Validation]: https://github.com/folktale/data.validation
   *
   *
   * @class
   */
  function Maybe() {}

  // The case for successful values
  Just.prototype = clone(Maybe.prototype);
  function Just(a) {
    this.value = a;
  }

  // The case for failure values
  Nothing.prototype = clone(Maybe.prototype);
  function Nothing() {}

  // -- Constructors -----------------------------------------------------

  /**
   * Constructs a new `Maybe[α]` structure with an absent value. Commonly used
   * to represent a failure.
   *
   * @summary Void → Maybe[α]
   */
  Maybe.Nothing = function () {
    return new Nothing();
  };
  Maybe.prototype.Nothing = Maybe.Nothing;

  /**
   * Constructs a new `Maybe[α]` structure that holds the single value
   * `α`. Commonly used to represent a success.
   *
   * `α` can be any value, including `null`, `undefined` or another
   * `Maybe[α]` structure.
   *
   * @summary α → Maybe[α]
   */
  Maybe.Just = function (a) {
    return new Just(a);
  };
  Maybe.prototype.Just = Maybe.Just;

  // -- Conversions ------------------------------------------------------

  /**
   * Constructs a new `Maybe[α]` structure from a nullable type.
   *
   * If the value is either `null` or `undefined`, this function returns a
   * `Nothing`, otherwise the value is wrapped in a `Just(α)`.
   *
   * @summary α → Maybe[α]
   */
  Maybe.fromNullable = function (a) {
    return a !== null ? new Just(a) : /* otherwise */new Nothing();
  };
  Maybe.prototype.fromNullable = Maybe.fromNullable;

  /**
   * Constructs a new `Maybe[β]` structure from an `Either[α, β]` type.
   *
   * The left side of the `Either` becomes `Nothing`, and the right side
   * is wrapped in a `Just(β)`.
   *
   * @summary Either[α, β] → Maybe[β]
   */
  Maybe.fromEither = function (a) {
    return a.fold(Maybe.Nothing, Maybe.Just);
  };
  Maybe.prototype.fromEither = Maybe.fromEither;

  /**
   * Constructs a new `Maybe[β]` structure from a `Validation[α, β]` type.
   *
   * The failure side of the `Validation` becomes `Nothing`, and the right
   * side is wrapped in a `Just(β)`.
   *
   * @method
   * @summary Validation[α, β] → Maybe[β]
   */
  Maybe.fromValidation = Maybe.fromEither;
  Maybe.prototype.fromValidation = Maybe.fromEither;

  // -- Predicates -------------------------------------------------------

  /**
   * True if the `Maybe[α]` structure contains a failure (i.e.: `Nothing`).
   *
   * @summary Boolean
   */
  Maybe.prototype.isNothing = false;
  Nothing.prototype.isNothing = true;

  /**
   * True if the `Maybe[α]` structure contains a single value (i.e.: `Just(α)`).
   *
   * @summary Boolean
   */
  Maybe.prototype.isJust = false;
  Just.prototype.isJust = true;

  // -- Applicative ------------------------------------------------------

  /**
   * Creates a new `Maybe[α]` structure holding the single value `α`.
   *
   * `α` can be any value, including `null`, `undefined`, or another
   * `Maybe[α]` structure.
   *
   * @summary α → Maybe[α]
   */
  Maybe.of = function (a) {
    return new Just(a);
  };
  Maybe.prototype.of = Maybe.of;

  /**
   * Applies the function inside the `Maybe[α]` structure to another
   * applicative type.
   *
   * The `Maybe[α]` structure should contain a function value, otherwise a
   * `TypeError` is thrown.
   *
   * @method
   * @summary (@Maybe[α → β], f:Applicative[_]) => f[α] → f[β]
   */
  Maybe.prototype.ap = unimplemented;

  Nothing.prototype.ap = noop;

  Just.prototype.ap = function (b) {
    return b.map(this.value);
  };

  // -- Functor ----------------------------------------------------------

  /**
   * Transforms the value of the `Maybe[α]` structure using a regular unary
   * function.
   *
   * @method
   * @summary @Maybe[α] => (α → β) → Maybe[β]
   */
  Maybe.prototype.map = unimplemented;
  Nothing.prototype.map = noop;

  Just.prototype.map = function (f) {
    return this.of(f(this.value));
  };

  // -- Chain ------------------------------------------------------------

  /**
   * Transforms the value of the `Maybe[α]` structure using an unary function
   * to monads.
   *
   * @method
   * @summary (@Maybe[α], m:Monad[_]) => (α → m[β]) → m[β]
   */
  Maybe.prototype.chain = unimplemented;
  Nothing.prototype.chain = noop;

  Just.prototype.chain = function (f) {
    return f(this.value);
  };

  // -- Show -------------------------------------------------------------

  /**
   * Returns a textual representation of the `Maybe[α]` structure.
   *
   * @method
   * @summary @Maybe[α] => Void → String
   */
  Maybe.prototype.toString = unimplemented;

  Nothing.prototype.toString = function () {
    return 'Maybe.Nothing';
  };

  Just.prototype.toString = function () {
    return 'Maybe.Just(' + this.value + ')';
  };

  // -- Eq ---------------------------------------------------------------

  /**
   * Tests if a `Maybe[α]` structure is equal to another `Maybe[α]` structure.
   *
   * @method
   * @summary @Maybe[α] => Maybe[α] → Boolean
   */
  Maybe.prototype.isEqual = unimplemented;

  Nothing.prototype.isEqual = function (b) {
    return b.isNothing;
  };

  Just.prototype.isEqual = function (b) {
    return b.isJust && b.value === this.value;
  };

  // -- Extracting and recovering ----------------------------------------

  /**
   * Extracts the value out of the `Maybe[α]` structure, if it
   * exists. Otherwise throws a `TypeError`.
   *
   * @method
   * @summary @Maybe[α] => Void → a,      :: partial, throws
   * @see {@link module:lib/maybe~Maybe#getOrElse} — A getter that can handle failures
   * @throws {TypeError} if the structure has no value (`Nothing`).
   */
  Maybe.prototype.get = unimplemented;

  Nothing.prototype.get = function () {
    throw new TypeError('Can\'t extract the value of a Nothing.');
  };

  Just.prototype.get = function () {
    return this.value;
  };

  /**
   * Extracts the value out of the `Maybe[α]` structure. If there is no value,
   * returns the given default.
   *
   * @method
   * @summary @Maybe[α] => α → α
   */
  Maybe.prototype.getOrElse = unimplemented;

  Nothing.prototype.getOrElse = function (a) {
    return a;
  };

  // eslint-disable-next-line no-unused-vars
  Just.prototype.getOrElse = function (_) {
    return this.value;
  };

  /**
   * Transforms a failure into a new `Maybe[α]` structure. Does nothing if the
   * structure already contains a value.
   *
   * @method
   * @summary @Maybe[α] => (Void → Maybe[α]) → Maybe[α]
   */
  Maybe.prototype.orElse = unimplemented;

  Nothing.prototype.orElse = function (f) {
    return f();
  };

  // eslint-disable-next-line no-unused-vars
  Just.prototype.orElse = function (_) {
    return this;
  };

  /**
   * Catamorphism.
   *
   * @method
   * @summary @Maybe[α] => { Nothing: Void → β, Just: α → β } → β
   */
  Maybe.prototype.cata = unimplemented;

  Nothing.prototype.cata = function (pattern) {
    return pattern.Nothing();
  };

  Just.prototype.cata = function (pattern) {
    return pattern.Just(this.value);
  };

  /**
   * JSON serialisation
   *
   * @method
   * @summary @Maybe[α] => Void → Object
   */
  Maybe.prototype.toJSON = unimplemented;

  Nothing.prototype.toJSON = function () {
    return { '#type': 'folktale:Maybe.Nothing' };
  };

  Just.prototype.toJSON = function () {
    return {
      '#type': 'folktale:Maybe.Just',
      value: this.value
    };
  };
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL21heWJlLmpzIl0sIm5hbWVzIjpbIk1heWJlIiwiY2xvbmUiLCJPYmplY3QiLCJjcmVhdGUiLCJ1bmltcGxlbWVudGVkIiwiRXJyb3IiLCJub29wIiwiSnVzdCIsInByb3RvdHlwZSIsImEiLCJ2YWx1ZSIsIk5vdGhpbmciLCJmcm9tTnVsbGFibGUiLCJmcm9tRWl0aGVyIiwiZm9sZCIsImZyb21WYWxpZGF0aW9uIiwiaXNOb3RoaW5nIiwiaXNKdXN0Iiwib2YiLCJhcCIsImIiLCJtYXAiLCJmIiwiY2hhaW4iLCJ0b1N0cmluZyIsImlzRXF1YWwiLCJnZXQiLCJUeXBlRXJyb3IiLCJnZXRPckVsc2UiLCJfIiwib3JFbHNlIiwiY2F0YSIsInBhdHRlcm4iLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztVQTRFZ0JBLEssR0FBQUEsSztBQTVFaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7O0FBRUE7QUFDQSxNQUFNQyxRQUFRQyxPQUFPQyxNQUFyQjtBQUNBLFdBQVNDLGFBQVQsR0FBeUI7QUFDdkIsVUFBTSxJQUFJQyxLQUFKLENBQVUsa0JBQVYsQ0FBTjtBQUNEO0FBQ0QsV0FBU0MsSUFBVCxHQUFnQjtBQUNkLFdBQU8sSUFBUDtBQUNEOztBQUVEOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1Q08sV0FBU04sS0FBVCxHQUFpQixDQUN2Qjs7QUFFRDtBQUNBTyxPQUFLQyxTQUFMLEdBQWlCUCxNQUFNRCxNQUFNUSxTQUFaLENBQWpCO0FBQ0EsV0FBU0QsSUFBVCxDQUFjRSxDQUFkLEVBQWlCO0FBQ2YsU0FBS0MsS0FBTCxHQUFhRCxDQUFiO0FBQ0Q7O0FBRUQ7QUFDQUUsVUFBUUgsU0FBUixHQUFvQlAsTUFBTUQsTUFBTVEsU0FBWixDQUFwQjtBQUNB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QUNELEdBRkQ7O0FBS0E7Ozs7Ozs7QUFPQVYsUUFBTVEsU0FBTixDQUFnQnNCLE1BQWhCLEdBQXlCMUIsYUFBekI7O0FBRUFPLFVBQVFILFNBQVIsQ0FBa0JzQixNQUFsQixHQUEyQixVQUFTUixDQUFULEVBQVk7QUFDckMsV0FBT0EsR0FBUDtBQUNELEdBRkQ7O0FBSUE7QUFDQWYsT0FBS0MsU0FBTCxDQUFlc0IsTUFBZixHQUF3QixVQUFTRCxDQUFULEVBQVk7QUFDbEMsV0FBTyxJQUFQO0FBQ0QsR0FGRDs7QUFLQTs7Ozs7O0FBTUE3QixRQUFNUSxTQUFOLENBQWdCdUIsSUFBaEIsR0FBdUIzQixhQUF2Qjs7QUFFQU8sVUFBUUgsU0FBUixDQUFrQnVCLElBQWxCLEdBQXlCLFVBQVNDLE9BQVQsRUFBa0I7QUFDekMsV0FBT0EsUUFBUXJCLE9BQVIsRUFBUDtBQUNELEdBRkQ7O0FBSUFKLE9BQUtDLFNBQUwsQ0FBZXVCLElBQWYsR0FBc0IsVUFBU0MsT0FBVCxFQUFrQjtBQUN0QyxXQUFPQSxRQUFRekIsSUFBUixDQUFhLEtBQUtHLEtBQWxCLENBQVA7QUFDRCxHQUZEOztBQUtBOzs7Ozs7QUFNQVYsUUFBTVEsU0FBTixDQUFnQnlCLE1BQWhCLEdBQXlCN0IsYUFBekI7O0FBRUFPLFVBQVFILFNBQVIsQ0FBa0J5QixNQUFsQixHQUEyQixZQUFXO0FBQ3BDLFdBQU8sRUFBRSxTQUFTLHdCQUFYLEVBQVA7QUFDRCxHQUZEOztBQUlBMUIsT0FBS0MsU0FBTCxDQUFleUIsTUFBZixHQUF3QixZQUFXO0FBQ2pDLFdBQU87QUFDTCxlQUFTLHFCQURKO0FBRUh2QixhQUFPLEtBQUtBO0FBRlQsS0FBUDtBQUlELEdBTEQiLCJmaWxlIjoibWF5YmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTMtMjAxNCBRdWlsZHJlZW4gTW90dGEgPHF1aWxkcmVlbkBnbWFpbC5jb20+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb25cbi8vIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzXG4vLyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sXG4vLyBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLFxuLy8gcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSxcbi8vIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sXG4vLyBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuLy8gaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbi8vIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbi8vIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbi8vIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbi8vIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8qKlxuICogQG1vZHVsZSBsaWIvbWF5YmVcbiAqL1xuLy8gbW9kdWxlLmV4cG9ydHMgPSBNYXliZVxuXG4vLyAtLSBBbGlhc2VzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGNsb25lID0gT2JqZWN0LmNyZWF0ZTtcbmZ1bmN0aW9uIHVuaW1wbGVtZW50ZWQoKSB7XG4gIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xufVxuZnVuY3Rpb24gbm9vcCgpIHtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8vIC0tIEltcGxlbWVudGF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEEgc3RydWN0dXJlIGZvciB2YWx1ZXMgdGhhdCBtYXkgbm90IGJlIHByZXNlbnQsIG9yIGNvbXB1dGF0aW9ucyB0aGF0IG1heVxuICogZmFpbC4gYE1heWJlKGEpYCBleHBsaWNpdGx5IG1vZGVscyB0aGUgZWZmZWN0cyB0aGF0IGFyZSBpbXBsaWNpdCBpblxuICogYE51bGxhYmxlYCB0eXBlcywgdGh1cyBoYXMgbm9uZSBvZiB0aGUgcHJvYmxlbXMgYXNzb2NpYXRlZCB3aXRoXG4gKiBgbnVsbGAgb3IgYHVuZGVmaW5lZGAg4oCUIGxpa2UgYE51bGxQb2ludGVyRXhjZXB0aW9uc2AuXG4gKlxuICogVGhlIGNsYXNzIG1vZGVscyB0d28gZGlmZmVyZW50IGNhc2VzOlxuICpcbiAqICArIGBKdXN0IGFgIOKAlCByZXByZXNlbnRzIGEgYE1heWJlKGEpYCB0aGF0IGNvbnRhaW5zIGEgdmFsdWUuIGBhYCBtYXlcbiAqICAgICBiZSBhbnkgdmFsdWUsIGluY2x1ZGluZyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAuXG4gKlxuICogICsgYE5vdGhpbmdgIOKAlCByZXByZXNlbnRzIGEgYE1heWJlKGEpYCB0aGF0IGhhcyBubyB2YWx1ZXMuIE9yIGFcbiAqICAgICBmYWlsdXJlIHRoYXQgbmVlZHMgbm8gYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cbiAqXG4gKiBDb21tb24gdXNlcyBvZiB0aGlzIHN0cnVjdHVyZSBpbmNsdWRlcyBtb2RlbGxpbmcgdmFsdWVzIHRoYXQgbWF5IG9yIG1heVxuICogbm90IGJlIHByZXNlbnQgaW4gYSBjb2xsZWN0aW9uLCB0aHVzIGluc3RlYWQgb2YgbmVlZGluZyBhXG4gKiBgY29sbGVjdGlvbi5oYXMoYSlgLCB0aGUgYGNvbGxlY3Rpb24uZ2V0KGEpYCBvcGVyYXRpb24gZ2l2ZXMgeW91IGFsbFxuICogdGhlIGluZm9ybWF0aW9uIHlvdSBuZWVkIOKAlCBgY29sbGVjdGlvbi5nZXQoYSkuaXMtbm90aGluZ2AgYmVpbmdcbiAqIGVxdWl2YWxlbnQgdG8gYGNvbGxlY3Rpb24uaGFzKGEpYDsgU2ltaWxhcmx5IHRoZSBzYW1lIHJlYXNvbmluZyBtYXlcbiAqIGJlIGFwcGxpZWQgdG8gY29tcHV0YXRpb25zIHRoYXQgbWF5IGZhaWwgdG8gcHJvdmlkZSBhIHZhbHVlLCBlLmcuOlxuICogYGNvbGxlY3Rpb24uZmluZChwcmVkaWNhdGUpYCBjYW4gc2FmZWx5IHJldHVybiBhIGBNYXliZShhKWAgaW5zdGFuY2UsXG4gKiBldmVuIGlmIHRoZSBjb2xsZWN0aW9uIGNvbnRhaW5zIG51bGxhYmxlIHZhbHVlcy5cbiAqXG4gKiBGdXJ0aGVybW9yZSwgdGhlIHZhbHVlcyBvZiBgTWF5YmUoYSlgIGNhbiBiZSBjb21iaW5lZCBhbmQgbWFuaXB1bGF0ZWRcbiAqIGJ5IHVzaW5nIHRoZSBleHByZXNzaXZlIG1vbmFkaWMgb3BlcmF0aW9ucy4gVGhpcyBhbGxvd3Mgc2FmZWx5XG4gKiBzZXF1ZW5jaW5nIG9wZXJhdGlvbnMgdGhhdCBtYXkgZmFpbCwgYW5kIHNhZmVseSBjb21wb3NpbmcgdmFsdWVzIHRoYXRcbiAqIHlvdSBkb24ndCBrbm93IHdoZXRoZXIgdGhleSdyZSBwcmVzZW50IG9yIG5vdCwgZmFpbGluZyBlYXJseVxuICogKHJldHVybmluZyBhIGBOb3RoaW5nYCkgaWYgYW55IG9mIHRoZSBvcGVyYXRpb25zIGZhaWwuXG4gKlxuICogSWYgb25lIHdhbnRzIHRvIHN0b3JlIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gYWJvdXQgZmFpbHVyZXMsIHRoZVxuICogW0VpdGhlcl1bXSBhbmQgW1ZhbGlkYXRpb25dW10gc3RydWN0dXJlcyBwcm92aWRlIHN1Y2ggYSBjYXBhYmlsaXR5LCBhbmRcbiAqIHNob3VsZCBiZSB1c2VkIGluc3RlYWQgb2YgdGhlIGBNYXliZShhKWAgc3RydWN0dXJlLlxuICpcbiAqIFtFaXRoZXJdOiBodHRwczovL2dpdGh1Yi5jb20vZm9sa3RhbGUvZGF0YS5laXRoZXJcbiAqIFtWYWxpZGF0aW9uXTogaHR0cHM6Ly9naXRodWIuY29tL2ZvbGt0YWxlL2RhdGEudmFsaWRhdGlvblxuICpcbiAqXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1heWJlKCkge1xufVxuXG4vLyBUaGUgY2FzZSBmb3Igc3VjY2Vzc2Z1bCB2YWx1ZXNcbkp1c3QucHJvdG90eXBlID0gY2xvbmUoTWF5YmUucHJvdG90eXBlKTtcbmZ1bmN0aW9uIEp1c3QoYSkge1xuICB0aGlzLnZhbHVlID0gYTtcbn1cblxuLy8gVGhlIGNhc2UgZm9yIGZhaWx1cmUgdmFsdWVzXG5Ob3RoaW5nLnByb3RvdHlwZSA9IGNsb25lKE1heWJlLnByb3RvdHlwZSk7XG5mdW5jdGlvbiBOb3RoaW5nKCkge1xufVxuXG5cbi8vIC0tIENvbnN0cnVjdG9ycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgYE1heWJlW86xXWAgc3RydWN0dXJlIHdpdGggYW4gYWJzZW50IHZhbHVlLiBDb21tb25seSB1c2VkXG4gKiB0byByZXByZXNlbnQgYSBmYWlsdXJlLlxuICpcbiAqIEBzdW1tYXJ5IFZvaWQg4oaSIE1heWJlW86xXVxuICovXG5NYXliZS5Ob3RoaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgTm90aGluZztcbn07XG5NYXliZS5wcm90b3R5cGUuTm90aGluZyA9IE1heWJlLk5vdGhpbmc7XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIG5ldyBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUgdGhhdCBob2xkcyB0aGUgc2luZ2xlIHZhbHVlXG4gKiBgzrFgLiBDb21tb25seSB1c2VkIHRvIHJlcHJlc2VudCBhIHN1Y2Nlc3MuXG4gKlxuICogYM6xYCBjYW4gYmUgYW55IHZhbHVlLCBpbmNsdWRpbmcgYG51bGxgLCBgdW5kZWZpbmVkYCBvciBhbm90aGVyXG4gKiBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUuXG4gKlxuICogQHN1bW1hcnkgzrEg4oaSIE1heWJlW86xXVxuICovXG5NYXliZS5KdXN0ID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gbmV3IEp1c3QoYSk7XG59O1xuTWF5YmUucHJvdG90eXBlLkp1c3QgPSBNYXliZS5KdXN0O1xuXG5cbi8vIC0tIENvbnZlcnNpb25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgYE1heWJlW86xXWAgc3RydWN0dXJlIGZyb20gYSBudWxsYWJsZSB0eXBlLlxuICpcbiAqIElmIHRoZSB2YWx1ZSBpcyBlaXRoZXIgYG51bGxgIG9yIGB1bmRlZmluZWRgLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgYVxuICogYE5vdGhpbmdgLCBvdGhlcndpc2UgdGhlIHZhbHVlIGlzIHdyYXBwZWQgaW4gYSBgSnVzdCjOsSlgLlxuICpcbiAqIEBzdW1tYXJ5IM6xIOKGkiBNYXliZVvOsV1cbiAqL1xuTWF5YmUuZnJvbU51bGxhYmxlID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gKGEgIT09IG51bGwpID8gbmV3IEp1c3QoYSlcbiAgICA6IC8qIG90aGVyd2lzZSAqLyBuZXcgTm90aGluZztcbn07XG5NYXliZS5wcm90b3R5cGUuZnJvbU51bGxhYmxlID0gTWF5YmUuZnJvbU51bGxhYmxlO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgYE1heWJlW86yXWAgc3RydWN0dXJlIGZyb20gYW4gYEVpdGhlclvOsSwgzrJdYCB0eXBlLlxuICpcbiAqIFRoZSBsZWZ0IHNpZGUgb2YgdGhlIGBFaXRoZXJgIGJlY29tZXMgYE5vdGhpbmdgLCBhbmQgdGhlIHJpZ2h0IHNpZGVcbiAqIGlzIHdyYXBwZWQgaW4gYSBgSnVzdCjOsilgLlxuICpcbiAqIEBzdW1tYXJ5IEVpdGhlclvOsSwgzrJdIOKGkiBNYXliZVvOsl1cbiAqL1xuTWF5YmUuZnJvbUVpdGhlciA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIGEuZm9sZChNYXliZS5Ob3RoaW5nLCBNYXliZS5KdXN0KTtcbn07XG5NYXliZS5wcm90b3R5cGUuZnJvbUVpdGhlciA9IE1heWJlLmZyb21FaXRoZXI7XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIG5ldyBgTWF5YmVbzrJdYCBzdHJ1Y3R1cmUgZnJvbSBhIGBWYWxpZGF0aW9uW86xLCDOsl1gIHR5cGUuXG4gKlxuICogVGhlIGZhaWx1cmUgc2lkZSBvZiB0aGUgYFZhbGlkYXRpb25gIGJlY29tZXMgYE5vdGhpbmdgLCBhbmQgdGhlIHJpZ2h0XG4gKiBzaWRlIGlzIHdyYXBwZWQgaW4gYSBgSnVzdCjOsilgLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IFZhbGlkYXRpb25bzrEsIM6yXSDihpIgTWF5YmVbzrJdXG4gKi9cbk1heWJlLmZyb21WYWxpZGF0aW9uID0gTWF5YmUuZnJvbUVpdGhlcjtcbk1heWJlLnByb3RvdHlwZS5mcm9tVmFsaWRhdGlvbiA9IE1heWJlLmZyb21FaXRoZXI7XG5cblxuLy8gLS0gUHJlZGljYXRlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogVHJ1ZSBpZiB0aGUgYE1heWJlW86xXWAgc3RydWN0dXJlIGNvbnRhaW5zIGEgZmFpbHVyZSAoaS5lLjogYE5vdGhpbmdgKS5cbiAqXG4gKiBAc3VtbWFyeSBCb29sZWFuXG4gKi9cbk1heWJlLnByb3RvdHlwZS5pc05vdGhpbmcgPSBmYWxzZTtcbk5vdGhpbmcucHJvdG90eXBlLmlzTm90aGluZyA9IHRydWU7XG5cblxuLyoqXG4gKiBUcnVlIGlmIHRoZSBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUgY29udGFpbnMgYSBzaW5nbGUgdmFsdWUgKGkuZS46IGBKdXN0KM6xKWApLlxuICpcbiAqIEBzdW1tYXJ5IEJvb2xlYW5cbiAqL1xuTWF5YmUucHJvdG90eXBlLmlzSnVzdCA9IGZhbHNlO1xuSnVzdC5wcm90b3R5cGUuaXNKdXN0ID0gdHJ1ZTtcblxuXG4vLyAtLSBBcHBsaWNhdGl2ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBNYXliZVvOsV1gIHN0cnVjdHVyZSBob2xkaW5nIHRoZSBzaW5nbGUgdmFsdWUgYM6xYC5cbiAqXG4gKiBgzrFgIGNhbiBiZSBhbnkgdmFsdWUsIGluY2x1ZGluZyBgbnVsbGAsIGB1bmRlZmluZWRgLCBvciBhbm90aGVyXG4gKiBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUuXG4gKlxuICogQHN1bW1hcnkgzrEg4oaSIE1heWJlW86xXVxuICovXG5NYXliZS5vZiA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIG5ldyBKdXN0KGEpO1xufTtcbk1heWJlLnByb3RvdHlwZS5vZiA9IE1heWJlLm9mO1xuXG5cbi8qKlxuICogQXBwbGllcyB0aGUgZnVuY3Rpb24gaW5zaWRlIHRoZSBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUgdG8gYW5vdGhlclxuICogYXBwbGljYXRpdmUgdHlwZS5cbiAqXG4gKiBUaGUgYE1heWJlW86xXWAgc3RydWN0dXJlIHNob3VsZCBjb250YWluIGEgZnVuY3Rpb24gdmFsdWUsIG90aGVyd2lzZSBhXG4gKiBgVHlwZUVycm9yYCBpcyB0aHJvd24uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBNYXliZVvOsSDihpIgzrJdLCBmOkFwcGxpY2F0aXZlW19dKSA9PiBmW86xXSDihpIgZlvOsl1cbiAqL1xuTWF5YmUucHJvdG90eXBlLmFwID0gdW5pbXBsZW1lbnRlZDtcblxuTm90aGluZy5wcm90b3R5cGUuYXAgPSBub29wO1xuXG5KdXN0LnByb3RvdHlwZS5hcCA9IGZ1bmN0aW9uKGIpIHtcbiAgcmV0dXJuIGIubWFwKHRoaXMudmFsdWUpO1xufTtcblxuXG4vLyAtLSBGdW5jdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2YWx1ZSBvZiB0aGUgYE1heWJlW86xXWAgc3RydWN0dXJlIHVzaW5nIGEgcmVndWxhciB1bmFyeVxuICogZnVuY3Rpb24uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgQE1heWJlW86xXSA9PiAozrEg4oaSIM6yKSDihpIgTWF5YmVbzrJdXG4gKi9cbk1heWJlLnByb3RvdHlwZS5tYXAgPSB1bmltcGxlbWVudGVkO1xuTm90aGluZy5wcm90b3R5cGUubWFwID0gbm9vcDtcblxuSnVzdC5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oZikge1xuICByZXR1cm4gdGhpcy5vZihmKHRoaXMudmFsdWUpKTtcbn07XG5cblxuLy8gLS0gQ2hhaW4gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmFsdWUgb2YgdGhlIGBNYXliZVvOsV1gIHN0cnVjdHVyZSB1c2luZyBhbiB1bmFyeSBmdW5jdGlvblxuICogdG8gbW9uYWRzLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChATWF5YmVbzrFdLCBtOk1vbmFkW19dKSA9PiAozrEg4oaSIG1bzrJdKSDihpIgbVvOsl1cbiAqL1xuTWF5YmUucHJvdG90eXBlLmNoYWluID0gdW5pbXBsZW1lbnRlZDtcbk5vdGhpbmcucHJvdG90eXBlLmNoYWluID0gbm9vcDtcblxuSnVzdC5wcm90b3R5cGUuY2hhaW4gPSBmdW5jdGlvbihmKSB7XG4gIHJldHVybiBmKHRoaXMudmFsdWUpO1xufTtcblxuXG4vLyAtLSBTaG93IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZXR1cm5zIGEgdGV4dHVhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgYE1heWJlW86xXWAgc3RydWN0dXJlLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IEBNYXliZVvOsV0gPT4gVm9pZCDihpIgU3RyaW5nXG4gKi9cbk1heWJlLnByb3RvdHlwZS50b1N0cmluZyA9IHVuaW1wbGVtZW50ZWQ7XG5cbk5vdGhpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnTWF5YmUuTm90aGluZyc7XG59O1xuXG5KdXN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ01heWJlLkp1c3QoJyArIHRoaXMudmFsdWUgKyAnKSc7XG59O1xuXG5cbi8vIC0tIEVxIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRlc3RzIGlmIGEgYE1heWJlW86xXWAgc3RydWN0dXJlIGlzIGVxdWFsIHRvIGFub3RoZXIgYE1heWJlW86xXWAgc3RydWN0dXJlLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IEBNYXliZVvOsV0gPT4gTWF5YmVbzrFdIOKGkiBCb29sZWFuXG4gKi9cbk1heWJlLnByb3RvdHlwZS5pc0VxdWFsID0gdW5pbXBsZW1lbnRlZDtcblxuTm90aGluZy5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uKGIpIHtcbiAgcmV0dXJuIGIuaXNOb3RoaW5nO1xufTtcblxuSnVzdC5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uKGIpIHtcbiAgcmV0dXJuIGIuaXNKdXN0XG4gICAgICAgICYmIGIudmFsdWUgPT09IHRoaXMudmFsdWU7XG59O1xuXG5cbi8vIC0tIEV4dHJhY3RpbmcgYW5kIHJlY292ZXJpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSB2YWx1ZSBvdXQgb2YgdGhlIGBNYXliZVvOsV1gIHN0cnVjdHVyZSwgaWYgaXRcbiAqIGV4aXN0cy4gT3RoZXJ3aXNlIHRocm93cyBhIGBUeXBlRXJyb3JgLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IEBNYXliZVvOsV0gPT4gVm9pZCDihpIgYSwgICAgICA6OiBwYXJ0aWFsLCB0aHJvd3NcbiAqIEBzZWUge0BsaW5rIG1vZHVsZTpsaWIvbWF5YmV+TWF5YmUjZ2V0T3JFbHNlfSDigJQgQSBnZXR0ZXIgdGhhdCBjYW4gaGFuZGxlIGZhaWx1cmVzXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IGlmIHRoZSBzdHJ1Y3R1cmUgaGFzIG5vIHZhbHVlIChgTm90aGluZ2ApLlxuICovXG5NYXliZS5wcm90b3R5cGUuZ2V0ID0gdW5pbXBsZW1lbnRlZDtcblxuTm90aGluZy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NhblxcJ3QgZXh0cmFjdCB0aGUgdmFsdWUgb2YgYSBOb3RoaW5nLicpO1xufTtcblxuSnVzdC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnZhbHVlO1xufTtcblxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSB2YWx1ZSBvdXQgb2YgdGhlIGBNYXliZVvOsV1gIHN0cnVjdHVyZS4gSWYgdGhlcmUgaXMgbm8gdmFsdWUsXG4gKiByZXR1cm5zIHRoZSBnaXZlbiBkZWZhdWx0LlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IEBNYXliZVvOsV0gPT4gzrEg4oaSIM6xXG4gKi9cbk1heWJlLnByb3RvdHlwZS5nZXRPckVsc2UgPSB1bmltcGxlbWVudGVkO1xuXG5Ob3RoaW5nLnByb3RvdHlwZS5nZXRPckVsc2UgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBhO1xufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5KdXN0LnByb3RvdHlwZS5nZXRPckVsc2UgPSBmdW5jdGlvbihfKSB7XG4gIHJldHVybiB0aGlzLnZhbHVlO1xufTtcblxuXG4vKipcbiAqIFRyYW5zZm9ybXMgYSBmYWlsdXJlIGludG8gYSBuZXcgYE1heWJlW86xXWAgc3RydWN0dXJlLiBEb2VzIG5vdGhpbmcgaWYgdGhlXG4gKiBzdHJ1Y3R1cmUgYWxyZWFkeSBjb250YWlucyBhIHZhbHVlLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IEBNYXliZVvOsV0gPT4gKFZvaWQg4oaSIE1heWJlW86xXSkg4oaSIE1heWJlW86xXVxuICovXG5NYXliZS5wcm90b3R5cGUub3JFbHNlID0gdW5pbXBsZW1lbnRlZDtcblxuTm90aGluZy5wcm90b3R5cGUub3JFbHNlID0gZnVuY3Rpb24oZikge1xuICByZXR1cm4gZigpO1xufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5KdXN0LnByb3RvdHlwZS5vckVsc2UgPSBmdW5jdGlvbihfKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vKipcbiAqIENhdGFtb3JwaGlzbS5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSBATWF5YmVbzrFdID0+IHsgTm90aGluZzogVm9pZCDihpIgzrIsIEp1c3Q6IM6xIOKGkiDOsiB9IOKGkiDOslxuICovXG5NYXliZS5wcm90b3R5cGUuY2F0YSA9IHVuaW1wbGVtZW50ZWQ7XG5cbk5vdGhpbmcucHJvdG90eXBlLmNhdGEgPSBmdW5jdGlvbihwYXR0ZXJuKSB7XG4gIHJldHVybiBwYXR0ZXJuLk5vdGhpbmcoKTtcbn07XG5cbkp1c3QucHJvdG90eXBlLmNhdGEgPSBmdW5jdGlvbihwYXR0ZXJuKSB7XG4gIHJldHVybiBwYXR0ZXJuLkp1c3QodGhpcy52YWx1ZSk7XG59O1xuXG5cbi8qKlxuICogSlNPTiBzZXJpYWxpc2F0aW9uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgQE1heWJlW86xXSA9PiBWb2lkIOKGkiBPYmplY3RcbiAqL1xuTWF5YmUucHJvdG90eXBlLnRvSlNPTiA9IHVuaW1wbGVtZW50ZWQ7XG5cbk5vdGhpbmcucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4geyAnI3R5cGUnOiAnZm9sa3RhbGU6TWF5YmUuTm90aGluZycgfTtcbn07XG5cbkp1c3QucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgICcjdHlwZSc6ICdmb2xrdGFsZTpNYXliZS5KdXN0J1xuICAgICwgdmFsdWU6IHRoaXMudmFsdWUsXG4gIH07XG59O1xuIl19