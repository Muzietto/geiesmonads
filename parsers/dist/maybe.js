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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL21heWJlLmpzIl0sIm5hbWVzIjpbIk1heWJlIiwiY2xvbmUiLCJPYmplY3QiLCJjcmVhdGUiLCJ1bmltcGxlbWVudGVkIiwiRXJyb3IiLCJub29wIiwiSnVzdCIsInByb3RvdHlwZSIsImEiLCJ2YWx1ZSIsIk5vdGhpbmciLCJmcm9tTnVsbGFibGUiLCJmcm9tRWl0aGVyIiwiZm9sZCIsImZyb21WYWxpZGF0aW9uIiwiaXNOb3RoaW5nIiwiaXNKdXN0Iiwib2YiLCJhcCIsImIiLCJtYXAiLCJmIiwiY2hhaW4iLCJ0b1N0cmluZyIsImlzRXF1YWwiLCJnZXQiLCJUeXBlRXJyb3IiLCJnZXRPckVsc2UiLCJfIiwib3JFbHNlIiwiY2F0YSIsInBhdHRlcm4iLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztVQTRFZ0JBLEssR0FBQUEsSztBQTVFaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7O0FBRUE7QUFDQSxNQUFNQyxRQUFRQyxPQUFPQyxNQUFyQjtBQUNBLFdBQVNDLGFBQVQsR0FBeUI7QUFDdkIsVUFBTSxJQUFJQyxLQUFKLENBQVUsa0JBQVYsQ0FBTjtBQUNEO0FBQ0QsV0FBU0MsSUFBVCxHQUFnQjtBQUNkLFdBQU8sSUFBUDtBQUNEOztBQUVEOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1Q08sV0FBU04sS0FBVCxHQUFpQixDQUN2Qjs7QUFFRDtBQUNBTyxPQUFLQyxTQUFMLEdBQWlCUCxNQUFNRCxNQUFNUSxTQUFaLENBQWpCO0FBQ0EsV0FBU0QsSUFBVCxDQUFjRSxDQUFkLEVBQWlCO0FBQ2YsU0FBS0MsS0FBTCxHQUFhRCxDQUFiO0FBQ0Q7O0FBRUQ7QUFDQUUsVUFBUUgsU0FBUixHQUFvQlAsTUFBTUQsTUFBTVEsU0FBWixDQUFwQjtBQUNB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QUNELEdBRkQ7O0FBS0E7Ozs7Ozs7QUFPQVYsUUFBTVEsU0FBTixDQUFnQnNCLE1BQWhCLEdBQXlCMUIsYUFBekI7O0FBRUFPLFVBQVFILFNBQVIsQ0FBa0JzQixNQUFsQixHQUEyQixVQUFTUixDQUFULEVBQVk7QUFDckMsV0FBT0EsR0FBUDtBQUNELEdBRkQ7O0FBSUE7QUFDQWYsT0FBS0MsU0FBTCxDQUFlc0IsTUFBZixHQUF3QixVQUFTRCxDQUFULEVBQVk7QUFDbEMsV0FBTyxJQUFQO0FBQ0QsR0FGRDs7QUFLQTs7Ozs7O0FBTUE3QixRQUFNUSxTQUFOLENBQWdCdUIsSUFBaEIsR0FBdUIzQixhQUF2Qjs7QUFFQU8sVUFBUUgsU0FBUixDQUFrQnVCLElBQWxCLEdBQXlCLFVBQVNDLE9BQVQsRUFBa0I7QUFDekMsV0FBT0EsUUFBUXJCLE9BQVIsRUFBUDtBQUNELEdBRkQ7O0FBSUFKLE9BQUtDLFNBQUwsQ0FBZXVCLElBQWYsR0FBc0IsVUFBU0MsT0FBVCxFQUFrQjtBQUN0QyxXQUFPQSxRQUFRekIsSUFBUixDQUFhLEtBQUtHLEtBQWxCLENBQVA7QUFDRCxHQUZEOztBQUtBOzs7Ozs7QUFNQVYsUUFBTVEsU0FBTixDQUFnQnlCLE1BQWhCLEdBQXlCN0IsYUFBekI7O0FBRUFPLFVBQVFILFNBQVIsQ0FBa0J5QixNQUFsQixHQUEyQixZQUFXO0FBQ3BDLFdBQU8sRUFBRSxTQUFTLHdCQUFYLEVBQVA7QUFDRCxHQUZEOztBQUlBMUIsT0FBS0MsU0FBTCxDQUFleUIsTUFBZixHQUF3QixZQUFXO0FBQ2pDLFdBQU87QUFDTCxlQUFTLHFCQURKO0FBRUh2QixhQUFPLEtBQUtBO0FBRlQsS0FBUDtBQUlELEdBTEQiLCJmaWxlIjoibWF5YmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTMtMjAxNCBRdWlsZHJlZW4gTW90dGEgPHF1aWxkcmVlbkBnbWFpbC5jb20+XHJcbi8vXHJcbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXHJcbi8vIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzXHJcbi8vICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbixcclxuLy8gaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSxcclxuLy8gcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSxcclxuLy8gYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcclxuLy8gc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbi8vXHJcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXHJcbi8vIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4vL1xyXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxyXG4vLyBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcclxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcclxuLy8gTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxyXG4vLyBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXHJcbi8vIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxyXG4vLyBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuXHJcbi8qKlxyXG4gKiBAbW9kdWxlIGxpYi9tYXliZVxyXG4gKi9cclxuLy8gbW9kdWxlLmV4cG9ydHMgPSBNYXliZVxyXG5cclxuLy8gLS0gQWxpYXNlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbmNvbnN0IGNsb25lID0gT2JqZWN0LmNyZWF0ZTtcclxuZnVuY3Rpb24gdW5pbXBsZW1lbnRlZCgpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKTtcclxufVxyXG5mdW5jdGlvbiBub29wKCkge1xyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG4vLyAtLSBJbXBsZW1lbnRhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBBIHN0cnVjdHVyZSBmb3IgdmFsdWVzIHRoYXQgbWF5IG5vdCBiZSBwcmVzZW50LCBvciBjb21wdXRhdGlvbnMgdGhhdCBtYXlcclxuICogZmFpbC4gYE1heWJlKGEpYCBleHBsaWNpdGx5IG1vZGVscyB0aGUgZWZmZWN0cyB0aGF0IGFyZSBpbXBsaWNpdCBpblxyXG4gKiBgTnVsbGFibGVgIHR5cGVzLCB0aHVzIGhhcyBub25lIG9mIHRoZSBwcm9ibGVtcyBhc3NvY2lhdGVkIHdpdGhcclxuICogYG51bGxgIG9yIGB1bmRlZmluZWRgIOKAlCBsaWtlIGBOdWxsUG9pbnRlckV4Y2VwdGlvbnNgLlxyXG4gKlxyXG4gKiBUaGUgY2xhc3MgbW9kZWxzIHR3byBkaWZmZXJlbnQgY2FzZXM6XHJcbiAqXHJcbiAqICArIGBKdXN0IGFgIOKAlCByZXByZXNlbnRzIGEgYE1heWJlKGEpYCB0aGF0IGNvbnRhaW5zIGEgdmFsdWUuIGBhYCBtYXlcclxuICogICAgIGJlIGFueSB2YWx1ZSwgaW5jbHVkaW5nIGBudWxsYCBvciBgdW5kZWZpbmVkYC5cclxuICpcclxuICogICsgYE5vdGhpbmdgIOKAlCByZXByZXNlbnRzIGEgYE1heWJlKGEpYCB0aGF0IGhhcyBubyB2YWx1ZXMuIE9yIGFcclxuICogICAgIGZhaWx1cmUgdGhhdCBuZWVkcyBubyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxyXG4gKlxyXG4gKiBDb21tb24gdXNlcyBvZiB0aGlzIHN0cnVjdHVyZSBpbmNsdWRlcyBtb2RlbGxpbmcgdmFsdWVzIHRoYXQgbWF5IG9yIG1heVxyXG4gKiBub3QgYmUgcHJlc2VudCBpbiBhIGNvbGxlY3Rpb24sIHRodXMgaW5zdGVhZCBvZiBuZWVkaW5nIGFcclxuICogYGNvbGxlY3Rpb24uaGFzKGEpYCwgdGhlIGBjb2xsZWN0aW9uLmdldChhKWAgb3BlcmF0aW9uIGdpdmVzIHlvdSBhbGxcclxuICogdGhlIGluZm9ybWF0aW9uIHlvdSBuZWVkIOKAlCBgY29sbGVjdGlvbi5nZXQoYSkuaXMtbm90aGluZ2AgYmVpbmdcclxuICogZXF1aXZhbGVudCB0byBgY29sbGVjdGlvbi5oYXMoYSlgOyBTaW1pbGFybHkgdGhlIHNhbWUgcmVhc29uaW5nIG1heVxyXG4gKiBiZSBhcHBsaWVkIHRvIGNvbXB1dGF0aW9ucyB0aGF0IG1heSBmYWlsIHRvIHByb3ZpZGUgYSB2YWx1ZSwgZS5nLjpcclxuICogYGNvbGxlY3Rpb24uZmluZChwcmVkaWNhdGUpYCBjYW4gc2FmZWx5IHJldHVybiBhIGBNYXliZShhKWAgaW5zdGFuY2UsXHJcbiAqIGV2ZW4gaWYgdGhlIGNvbGxlY3Rpb24gY29udGFpbnMgbnVsbGFibGUgdmFsdWVzLlxyXG4gKlxyXG4gKiBGdXJ0aGVybW9yZSwgdGhlIHZhbHVlcyBvZiBgTWF5YmUoYSlgIGNhbiBiZSBjb21iaW5lZCBhbmQgbWFuaXB1bGF0ZWRcclxuICogYnkgdXNpbmcgdGhlIGV4cHJlc3NpdmUgbW9uYWRpYyBvcGVyYXRpb25zLiBUaGlzIGFsbG93cyBzYWZlbHlcclxuICogc2VxdWVuY2luZyBvcGVyYXRpb25zIHRoYXQgbWF5IGZhaWwsIGFuZCBzYWZlbHkgY29tcG9zaW5nIHZhbHVlcyB0aGF0XHJcbiAqIHlvdSBkb24ndCBrbm93IHdoZXRoZXIgdGhleSdyZSBwcmVzZW50IG9yIG5vdCwgZmFpbGluZyBlYXJseVxyXG4gKiAocmV0dXJuaW5nIGEgYE5vdGhpbmdgKSBpZiBhbnkgb2YgdGhlIG9wZXJhdGlvbnMgZmFpbC5cclxuICpcclxuICogSWYgb25lIHdhbnRzIHRvIHN0b3JlIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gYWJvdXQgZmFpbHVyZXMsIHRoZVxyXG4gKiBbRWl0aGVyXVtdIGFuZCBbVmFsaWRhdGlvbl1bXSBzdHJ1Y3R1cmVzIHByb3ZpZGUgc3VjaCBhIGNhcGFiaWxpdHksIGFuZFxyXG4gKiBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkIG9mIHRoZSBgTWF5YmUoYSlgIHN0cnVjdHVyZS5cclxuICpcclxuICogW0VpdGhlcl06IGh0dHBzOi8vZ2l0aHViLmNvbS9mb2xrdGFsZS9kYXRhLmVpdGhlclxyXG4gKiBbVmFsaWRhdGlvbl06IGh0dHBzOi8vZ2l0aHViLmNvbS9mb2xrdGFsZS9kYXRhLnZhbGlkYXRpb25cclxuICpcclxuICpcclxuICogQGNsYXNzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gTWF5YmUoKSB7XHJcbn1cclxuXHJcbi8vIFRoZSBjYXNlIGZvciBzdWNjZXNzZnVsIHZhbHVlc1xyXG5KdXN0LnByb3RvdHlwZSA9IGNsb25lKE1heWJlLnByb3RvdHlwZSk7XHJcbmZ1bmN0aW9uIEp1c3QoYSkge1xyXG4gIHRoaXMudmFsdWUgPSBhO1xyXG59XHJcblxyXG4vLyBUaGUgY2FzZSBmb3IgZmFpbHVyZSB2YWx1ZXNcclxuTm90aGluZy5wcm90b3R5cGUgPSBjbG9uZShNYXliZS5wcm90b3R5cGUpO1xyXG5mdW5jdGlvbiBOb3RoaW5nKCkge1xyXG59XHJcblxyXG5cclxuLy8gLS0gQ29uc3RydWN0b3JzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICogQ29uc3RydWN0cyBhIG5ldyBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUgd2l0aCBhbiBhYnNlbnQgdmFsdWUuIENvbW1vbmx5IHVzZWRcclxuICogdG8gcmVwcmVzZW50IGEgZmFpbHVyZS5cclxuICpcclxuICogQHN1bW1hcnkgVm9pZCDihpIgTWF5YmVbzrFdXHJcbiAqL1xyXG5NYXliZS5Ob3RoaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIG5ldyBOb3RoaW5nO1xyXG59O1xyXG5NYXliZS5wcm90b3R5cGUuTm90aGluZyA9IE1heWJlLk5vdGhpbmc7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0cyBhIG5ldyBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUgdGhhdCBob2xkcyB0aGUgc2luZ2xlIHZhbHVlXHJcbiAqIGDOsWAuIENvbW1vbmx5IHVzZWQgdG8gcmVwcmVzZW50IGEgc3VjY2Vzcy5cclxuICpcclxuICogYM6xYCBjYW4gYmUgYW55IHZhbHVlLCBpbmNsdWRpbmcgYG51bGxgLCBgdW5kZWZpbmVkYCBvciBhbm90aGVyXHJcbiAqIGBNYXliZVvOsV1gIHN0cnVjdHVyZS5cclxuICpcclxuICogQHN1bW1hcnkgzrEg4oaSIE1heWJlW86xXVxyXG4gKi9cclxuTWF5YmUuSnVzdCA9IGZ1bmN0aW9uKGEpIHtcclxuICByZXR1cm4gbmV3IEp1c3QoYSk7XHJcbn07XHJcbk1heWJlLnByb3RvdHlwZS5KdXN0ID0gTWF5YmUuSnVzdDtcclxuXHJcblxyXG4vLyAtLSBDb252ZXJzaW9ucyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RzIGEgbmV3IGBNYXliZVvOsV1gIHN0cnVjdHVyZSBmcm9tIGEgbnVsbGFibGUgdHlwZS5cclxuICpcclxuICogSWYgdGhlIHZhbHVlIGlzIGVpdGhlciBgbnVsbGAgb3IgYHVuZGVmaW5lZGAsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyBhXHJcbiAqIGBOb3RoaW5nYCwgb3RoZXJ3aXNlIHRoZSB2YWx1ZSBpcyB3cmFwcGVkIGluIGEgYEp1c3QozrEpYC5cclxuICpcclxuICogQHN1bW1hcnkgzrEg4oaSIE1heWJlW86xXVxyXG4gKi9cclxuTWF5YmUuZnJvbU51bGxhYmxlID0gZnVuY3Rpb24oYSkge1xyXG4gIHJldHVybiAoYSAhPT0gbnVsbCkgPyBuZXcgSnVzdChhKVxyXG4gICAgOiAvKiBvdGhlcndpc2UgKi8gbmV3IE5vdGhpbmc7XHJcbn07XHJcbk1heWJlLnByb3RvdHlwZS5mcm9tTnVsbGFibGUgPSBNYXliZS5mcm9tTnVsbGFibGU7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0cyBhIG5ldyBgTWF5YmVbzrJdYCBzdHJ1Y3R1cmUgZnJvbSBhbiBgRWl0aGVyW86xLCDOsl1gIHR5cGUuXHJcbiAqXHJcbiAqIFRoZSBsZWZ0IHNpZGUgb2YgdGhlIGBFaXRoZXJgIGJlY29tZXMgYE5vdGhpbmdgLCBhbmQgdGhlIHJpZ2h0IHNpZGVcclxuICogaXMgd3JhcHBlZCBpbiBhIGBKdXN0KM6yKWAuXHJcbiAqXHJcbiAqIEBzdW1tYXJ5IEVpdGhlclvOsSwgzrJdIOKGkiBNYXliZVvOsl1cclxuICovXHJcbk1heWJlLmZyb21FaXRoZXIgPSBmdW5jdGlvbihhKSB7XHJcbiAgcmV0dXJuIGEuZm9sZChNYXliZS5Ob3RoaW5nLCBNYXliZS5KdXN0KTtcclxufTtcclxuTWF5YmUucHJvdG90eXBlLmZyb21FaXRoZXIgPSBNYXliZS5mcm9tRWl0aGVyO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdHMgYSBuZXcgYE1heWJlW86yXWAgc3RydWN0dXJlIGZyb20gYSBgVmFsaWRhdGlvblvOsSwgzrJdYCB0eXBlLlxyXG4gKlxyXG4gKiBUaGUgZmFpbHVyZSBzaWRlIG9mIHRoZSBgVmFsaWRhdGlvbmAgYmVjb21lcyBgTm90aGluZ2AsIGFuZCB0aGUgcmlnaHRcclxuICogc2lkZSBpcyB3cmFwcGVkIGluIGEgYEp1c3QozrIpYC5cclxuICpcclxuICogQG1ldGhvZFxyXG4gKiBAc3VtbWFyeSBWYWxpZGF0aW9uW86xLCDOsl0g4oaSIE1heWJlW86yXVxyXG4gKi9cclxuTWF5YmUuZnJvbVZhbGlkYXRpb24gPSBNYXliZS5mcm9tRWl0aGVyO1xyXG5NYXliZS5wcm90b3R5cGUuZnJvbVZhbGlkYXRpb24gPSBNYXliZS5mcm9tRWl0aGVyO1xyXG5cclxuXHJcbi8vIC0tIFByZWRpY2F0ZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLyoqXHJcbiAqIFRydWUgaWYgdGhlIGBNYXliZVvOsV1gIHN0cnVjdHVyZSBjb250YWlucyBhIGZhaWx1cmUgKGkuZS46IGBOb3RoaW5nYCkuXHJcbiAqXHJcbiAqIEBzdW1tYXJ5IEJvb2xlYW5cclxuICovXHJcbk1heWJlLnByb3RvdHlwZS5pc05vdGhpbmcgPSBmYWxzZTtcclxuTm90aGluZy5wcm90b3R5cGUuaXNOb3RoaW5nID0gdHJ1ZTtcclxuXHJcblxyXG4vKipcclxuICogVHJ1ZSBpZiB0aGUgYE1heWJlW86xXWAgc3RydWN0dXJlIGNvbnRhaW5zIGEgc2luZ2xlIHZhbHVlIChpLmUuOiBgSnVzdCjOsSlgKS5cclxuICpcclxuICogQHN1bW1hcnkgQm9vbGVhblxyXG4gKi9cclxuTWF5YmUucHJvdG90eXBlLmlzSnVzdCA9IGZhbHNlO1xyXG5KdXN0LnByb3RvdHlwZS5pc0p1c3QgPSB0cnVlO1xyXG5cclxuXHJcbi8vIC0tIEFwcGxpY2F0aXZlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgYE1heWJlW86xXWAgc3RydWN0dXJlIGhvbGRpbmcgdGhlIHNpbmdsZSB2YWx1ZSBgzrFgLlxyXG4gKlxyXG4gKiBgzrFgIGNhbiBiZSBhbnkgdmFsdWUsIGluY2x1ZGluZyBgbnVsbGAsIGB1bmRlZmluZWRgLCBvciBhbm90aGVyXHJcbiAqIGBNYXliZVvOsV1gIHN0cnVjdHVyZS5cclxuICpcclxuICogQHN1bW1hcnkgzrEg4oaSIE1heWJlW86xXVxyXG4gKi9cclxuTWF5YmUub2YgPSBmdW5jdGlvbihhKSB7XHJcbiAgcmV0dXJuIG5ldyBKdXN0KGEpO1xyXG59O1xyXG5NYXliZS5wcm90b3R5cGUub2YgPSBNYXliZS5vZjtcclxuXHJcblxyXG4vKipcclxuICogQXBwbGllcyB0aGUgZnVuY3Rpb24gaW5zaWRlIHRoZSBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUgdG8gYW5vdGhlclxyXG4gKiBhcHBsaWNhdGl2ZSB0eXBlLlxyXG4gKlxyXG4gKiBUaGUgYE1heWJlW86xXWAgc3RydWN0dXJlIHNob3VsZCBjb250YWluIGEgZnVuY3Rpb24gdmFsdWUsIG90aGVyd2lzZSBhXHJcbiAqIGBUeXBlRXJyb3JgIGlzIHRocm93bi5cclxuICpcclxuICogQG1ldGhvZFxyXG4gKiBAc3VtbWFyeSAoQE1heWJlW86xIOKGkiDOsl0sIGY6QXBwbGljYXRpdmVbX10pID0+IGZbzrFdIOKGkiBmW86yXVxyXG4gKi9cclxuTWF5YmUucHJvdG90eXBlLmFwID0gdW5pbXBsZW1lbnRlZDtcclxuXHJcbk5vdGhpbmcucHJvdG90eXBlLmFwID0gbm9vcDtcclxuXHJcbkp1c3QucHJvdG90eXBlLmFwID0gZnVuY3Rpb24oYikge1xyXG4gIHJldHVybiBiLm1hcCh0aGlzLnZhbHVlKTtcclxufTtcclxuXHJcblxyXG4vLyAtLSBGdW5jdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2YWx1ZSBvZiB0aGUgYE1heWJlW86xXWAgc3RydWN0dXJlIHVzaW5nIGEgcmVndWxhciB1bmFyeVxyXG4gKiBmdW5jdGlvbi5cclxuICpcclxuICogQG1ldGhvZFxyXG4gKiBAc3VtbWFyeSBATWF5YmVbzrFdID0+ICjOsSDihpIgzrIpIOKGkiBNYXliZVvOsl1cclxuICovXHJcbk1heWJlLnByb3RvdHlwZS5tYXAgPSB1bmltcGxlbWVudGVkO1xyXG5Ob3RoaW5nLnByb3RvdHlwZS5tYXAgPSBub29wO1xyXG5cclxuSnVzdC5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oZikge1xyXG4gIHJldHVybiB0aGlzLm9mKGYodGhpcy52YWx1ZSkpO1xyXG59O1xyXG5cclxuXHJcbi8vIC0tIENoYWluIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZhbHVlIG9mIHRoZSBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUgdXNpbmcgYW4gdW5hcnkgZnVuY3Rpb25cclxuICogdG8gbW9uYWRzLlxyXG4gKlxyXG4gKiBAbWV0aG9kXHJcbiAqIEBzdW1tYXJ5IChATWF5YmVbzrFdLCBtOk1vbmFkW19dKSA9PiAozrEg4oaSIG1bzrJdKSDihpIgbVvOsl1cclxuICovXHJcbk1heWJlLnByb3RvdHlwZS5jaGFpbiA9IHVuaW1wbGVtZW50ZWQ7XHJcbk5vdGhpbmcucHJvdG90eXBlLmNoYWluID0gbm9vcDtcclxuXHJcbkp1c3QucHJvdG90eXBlLmNoYWluID0gZnVuY3Rpb24oZikge1xyXG4gIHJldHVybiBmKHRoaXMudmFsdWUpO1xyXG59O1xyXG5cclxuXHJcbi8vIC0tIFNob3cgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUuXHJcbiAqXHJcbiAqIEBtZXRob2RcclxuICogQHN1bW1hcnkgQE1heWJlW86xXSA9PiBWb2lkIOKGkiBTdHJpbmdcclxuICovXHJcbk1heWJlLnByb3RvdHlwZS50b1N0cmluZyA9IHVuaW1wbGVtZW50ZWQ7XHJcblxyXG5Ob3RoaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiAnTWF5YmUuTm90aGluZyc7XHJcbn07XHJcblxyXG5KdXN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiAnTWF5YmUuSnVzdCgnICsgdGhpcy52YWx1ZSArICcpJztcclxufTtcclxuXHJcblxyXG4vLyAtLSBFcSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBUZXN0cyBpZiBhIGBNYXliZVvOsV1gIHN0cnVjdHVyZSBpcyBlcXVhbCB0byBhbm90aGVyIGBNYXliZVvOsV1gIHN0cnVjdHVyZS5cclxuICpcclxuICogQG1ldGhvZFxyXG4gKiBAc3VtbWFyeSBATWF5YmVbzrFdID0+IE1heWJlW86xXSDihpIgQm9vbGVhblxyXG4gKi9cclxuTWF5YmUucHJvdG90eXBlLmlzRXF1YWwgPSB1bmltcGxlbWVudGVkO1xyXG5cclxuTm90aGluZy5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uKGIpIHtcclxuICByZXR1cm4gYi5pc05vdGhpbmc7XHJcbn07XHJcblxyXG5KdXN0LnByb3RvdHlwZS5pc0VxdWFsID0gZnVuY3Rpb24oYikge1xyXG4gIHJldHVybiBiLmlzSnVzdFxyXG4gICAgICAgICYmIGIudmFsdWUgPT09IHRoaXMudmFsdWU7XHJcbn07XHJcblxyXG5cclxuLy8gLS0gRXh0cmFjdGluZyBhbmQgcmVjb3ZlcmluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICogRXh0cmFjdHMgdGhlIHZhbHVlIG91dCBvZiB0aGUgYE1heWJlW86xXWAgc3RydWN0dXJlLCBpZiBpdFxyXG4gKiBleGlzdHMuIE90aGVyd2lzZSB0aHJvd3MgYSBgVHlwZUVycm9yYC5cclxuICpcclxuICogQG1ldGhvZFxyXG4gKiBAc3VtbWFyeSBATWF5YmVbzrFdID0+IFZvaWQg4oaSIGEsICAgICAgOjogcGFydGlhbCwgdGhyb3dzXHJcbiAqIEBzZWUge0BsaW5rIG1vZHVsZTpsaWIvbWF5YmV+TWF5YmUjZ2V0T3JFbHNlfSDigJQgQSBnZXR0ZXIgdGhhdCBjYW4gaGFuZGxlIGZhaWx1cmVzXHJcbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gaWYgdGhlIHN0cnVjdHVyZSBoYXMgbm8gdmFsdWUgKGBOb3RoaW5nYCkuXHJcbiAqL1xyXG5NYXliZS5wcm90b3R5cGUuZ2V0ID0gdW5pbXBsZW1lbnRlZDtcclxuXHJcbk5vdGhpbmcucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCkge1xyXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NhblxcJ3QgZXh0cmFjdCB0aGUgdmFsdWUgb2YgYSBOb3RoaW5nLicpO1xyXG59O1xyXG5cclxuSnVzdC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEV4dHJhY3RzIHRoZSB2YWx1ZSBvdXQgb2YgdGhlIGBNYXliZVvOsV1gIHN0cnVjdHVyZS4gSWYgdGhlcmUgaXMgbm8gdmFsdWUsXHJcbiAqIHJldHVybnMgdGhlIGdpdmVuIGRlZmF1bHQuXHJcbiAqXHJcbiAqIEBtZXRob2RcclxuICogQHN1bW1hcnkgQE1heWJlW86xXSA9PiDOsSDihpIgzrFcclxuICovXHJcbk1heWJlLnByb3RvdHlwZS5nZXRPckVsc2UgPSB1bmltcGxlbWVudGVkO1xyXG5cclxuTm90aGluZy5wcm90b3R5cGUuZ2V0T3JFbHNlID0gZnVuY3Rpb24oYSkge1xyXG4gIHJldHVybiBhO1xyXG59O1xyXG5cclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXHJcbkp1c3QucHJvdG90eXBlLmdldE9yRWxzZSA9IGZ1bmN0aW9uKF8pIHtcclxuICByZXR1cm4gdGhpcy52YWx1ZTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtcyBhIGZhaWx1cmUgaW50byBhIG5ldyBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUuIERvZXMgbm90aGluZyBpZiB0aGVcclxuICogc3RydWN0dXJlIGFscmVhZHkgY29udGFpbnMgYSB2YWx1ZS5cclxuICpcclxuICogQG1ldGhvZFxyXG4gKiBAc3VtbWFyeSBATWF5YmVbzrFdID0+IChWb2lkIOKGkiBNYXliZVvOsV0pIOKGkiBNYXliZVvOsV1cclxuICovXHJcbk1heWJlLnByb3RvdHlwZS5vckVsc2UgPSB1bmltcGxlbWVudGVkO1xyXG5cclxuTm90aGluZy5wcm90b3R5cGUub3JFbHNlID0gZnVuY3Rpb24oZikge1xyXG4gIHJldHVybiBmKCk7XHJcbn07XHJcblxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcclxuSnVzdC5wcm90b3R5cGUub3JFbHNlID0gZnVuY3Rpb24oXykge1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDYXRhbW9ycGhpc20uXHJcbiAqXHJcbiAqIEBtZXRob2RcclxuICogQHN1bW1hcnkgQE1heWJlW86xXSA9PiB7IE5vdGhpbmc6IFZvaWQg4oaSIM6yLCBKdXN0OiDOsSDihpIgzrIgfSDihpIgzrJcclxuICovXHJcbk1heWJlLnByb3RvdHlwZS5jYXRhID0gdW5pbXBsZW1lbnRlZDtcclxuXHJcbk5vdGhpbmcucHJvdG90eXBlLmNhdGEgPSBmdW5jdGlvbihwYXR0ZXJuKSB7XHJcbiAgcmV0dXJuIHBhdHRlcm4uTm90aGluZygpO1xyXG59O1xyXG5cclxuSnVzdC5wcm90b3R5cGUuY2F0YSA9IGZ1bmN0aW9uKHBhdHRlcm4pIHtcclxuICByZXR1cm4gcGF0dGVybi5KdXN0KHRoaXMudmFsdWUpO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBKU09OIHNlcmlhbGlzYXRpb25cclxuICpcclxuICogQG1ldGhvZFxyXG4gKiBAc3VtbWFyeSBATWF5YmVbzrFdID0+IFZvaWQg4oaSIE9iamVjdFxyXG4gKi9cclxuTWF5YmUucHJvdG90eXBlLnRvSlNPTiA9IHVuaW1wbGVtZW50ZWQ7XHJcblxyXG5Ob3RoaW5nLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4geyAnI3R5cGUnOiAnZm9sa3RhbGU6TWF5YmUuTm90aGluZycgfTtcclxufTtcclxuXHJcbkp1c3QucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICAnI3R5cGUnOiAnZm9sa3RhbGU6TWF5YmUuSnVzdCdcclxuICAgICwgdmFsdWU6IHRoaXMudmFsdWUsXHJcbiAgfTtcclxufTtcclxuIl19