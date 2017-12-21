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
    //module.exports = Maybe

    // -- Aliases ----------------------------------------------------------
    var clone = Object.create;
    var unimplemented = function unimplemented() {
        throw new Error('Not implemented.');
    };
    var noop = function noop() {
        return this;
    };

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL21heWJlLmpzIl0sIm5hbWVzIjpbIk1heWJlIiwiY2xvbmUiLCJPYmplY3QiLCJjcmVhdGUiLCJ1bmltcGxlbWVudGVkIiwiRXJyb3IiLCJub29wIiwiSnVzdCIsInByb3RvdHlwZSIsImEiLCJ2YWx1ZSIsIk5vdGhpbmciLCJmcm9tTnVsbGFibGUiLCJmcm9tRWl0aGVyIiwiZm9sZCIsImZyb21WYWxpZGF0aW9uIiwiaXNOb3RoaW5nIiwiaXNKdXN0Iiwib2YiLCJhcCIsImIiLCJtYXAiLCJmIiwiY2hhaW4iLCJ0b1N0cmluZyIsImlzRXF1YWwiLCJnZXQiLCJUeXBlRXJyb3IiLCJnZXRPckVsc2UiLCJfIiwib3JFbHNlIiwiY2F0YSIsInBhdHRlcm4iLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7Ozs7OztZQTRFZ0JBLEssR0FBQUEsSztBQTVFaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7O0FBRUE7QUFDQSxRQUFNQyxRQUFRQyxPQUFPQyxNQUFyQjtBQUNBLFFBQU1DLGdCQUFnQixTQUFoQkEsYUFBZ0IsR0FBWTtBQUM5QixjQUFNLElBQUlDLEtBQUosQ0FBVSxrQkFBVixDQUFOO0FBQ0gsS0FGRDtBQUdBLFFBQU1DLE9BQU8sU0FBUEEsSUFBTyxHQUFZO0FBQ3JCLGVBQU8sSUFBUDtBQUNILEtBRkQ7O0FBSUE7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVDTyxhQUFTTixLQUFULEdBQWlCLENBQ3ZCOztBQUVEO0FBQ0FPLFNBQUtDLFNBQUwsR0FBaUJQLE1BQU1ELE1BQU1RLFNBQVosQ0FBakI7QUFDQSxhQUFTRCxJQUFULENBQWNFLENBQWQsRUFBaUI7QUFDYixhQUFLQyxLQUFMLEdBQWFELENBQWI7QUFDSDs7QUFFRDtBQUNBRSxZQUFRSCxTQUFS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LEVBQWE7QUFDcEMsZUFBTyxLQUFLbkIsS0FBWjtBQUNILEtBRkQ7O0FBS0E7Ozs7Ozs7QUFPQVYsVUFBTVEsU0FBTixDQUFnQnNCLE1BQWhCLEdBQXlCMUIsYUFBekI7O0FBRUFPLFlBQVFILFNBQVIsQ0FBa0JzQixNQUFsQixHQUEyQixVQUFVUixDQUFWLEVBQWE7QUFDcEMsZUFBT0EsR0FBUDtBQUNILEtBRkQ7O0FBSUFmLFNBQUtDLFNBQUwsQ0FBZXNCLE1BQWYsR0FBd0IsVUFBVUQsQ0FBVixFQUFhO0FBQ2pDLGVBQU8sSUFBUDtBQUNILEtBRkQ7O0FBS0E7Ozs7OztBQU1BN0IsVUFBTVEsU0FBTixDQUFnQnVCLElBQWhCLEdBQXVCM0IsYUFBdkI7O0FBRUFPLFlBQVFILFNBQVIsQ0FBa0J1QixJQUFsQixHQUF5QixVQUFVQyxPQUFWLEVBQW1CO0FBQ3hDLGVBQU9BLFFBQVFyQixPQUFSLEVBQVA7QUFDSCxLQUZEOztBQUlBSixTQUFLQyxTQUFMLENBQWV1QixJQUFmLEdBQXNCLFVBQVVDLE9BQVYsRUFBbUI7QUFDckMsZUFBT0EsUUFBUXpCLElBQVIsQ0FBYSxLQUFLRyxLQUFsQixDQUFQO0FBQ0gsS0FGRDs7QUFLQTs7Ozs7O0FBTUFWLFVBQU1RLFNBQU4sQ0FBZ0J5QixNQUFoQixHQUF5QjdCLGFBQXpCOztBQUVBTyxZQUFRSCxTQUFSLENBQWtCeUIsTUFBbEIsR0FBMkIsWUFBWTtBQUNuQyxlQUFPLEVBQUMsU0FBUyx3QkFBVixFQUFQO0FBQ0gsS0FGRDs7QUFJQTFCLFNBQUtDLFNBQUwsQ0FBZXlCLE1BQWYsR0FBd0IsWUFBWTtBQUNoQyxlQUFPO0FBQ0gscUJBQVMscUJBRE47QUFFRHZCLG1CQUFPLEtBQUtBO0FBRlgsU0FBUDtBQUlILEtBTEQiLCJmaWxlIjoibWF5YmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTMtMjAxNCBRdWlsZHJlZW4gTW90dGEgPHF1aWxkcmVlbkBnbWFpbC5jb20+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb25cbi8vIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzXG4vLyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sXG4vLyBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLFxuLy8gcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSxcbi8vIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sXG4vLyBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuLy8gaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbi8vIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbi8vIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbi8vIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbi8vIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8qKlxuICogQG1vZHVsZSBsaWIvbWF5YmVcbiAqL1xuLy9tb2R1bGUuZXhwb3J0cyA9IE1heWJlXG5cbi8vIC0tIEFsaWFzZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgY2xvbmUgPSBPYmplY3QuY3JlYXRlO1xuY29uc3QgdW5pbXBsZW1lbnRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKTtcbn07XG5jb25zdCBub29wID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLy8gLS0gSW1wbGVtZW50YXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQSBzdHJ1Y3R1cmUgZm9yIHZhbHVlcyB0aGF0IG1heSBub3QgYmUgcHJlc2VudCwgb3IgY29tcHV0YXRpb25zIHRoYXQgbWF5XG4gKiBmYWlsLiBgTWF5YmUoYSlgIGV4cGxpY2l0bHkgbW9kZWxzIHRoZSBlZmZlY3RzIHRoYXQgYXJlIGltcGxpY2l0IGluXG4gKiBgTnVsbGFibGVgIHR5cGVzLCB0aHVzIGhhcyBub25lIG9mIHRoZSBwcm9ibGVtcyBhc3NvY2lhdGVkIHdpdGhcbiAqIGBudWxsYCBvciBgdW5kZWZpbmVkYCDigJQgbGlrZSBgTnVsbFBvaW50ZXJFeGNlcHRpb25zYC5cbiAqXG4gKiBUaGUgY2xhc3MgbW9kZWxzIHR3byBkaWZmZXJlbnQgY2FzZXM6XG4gKlxuICogICsgYEp1c3QgYWAg4oCUIHJlcHJlc2VudHMgYSBgTWF5YmUoYSlgIHRoYXQgY29udGFpbnMgYSB2YWx1ZS4gYGFgIG1heVxuICogICAgIGJlIGFueSB2YWx1ZSwgaW5jbHVkaW5nIGBudWxsYCBvciBgdW5kZWZpbmVkYC5cbiAqXG4gKiAgKyBgTm90aGluZ2Ag4oCUIHJlcHJlc2VudHMgYSBgTWF5YmUoYSlgIHRoYXQgaGFzIG5vIHZhbHVlcy4gT3IgYVxuICogICAgIGZhaWx1cmUgdGhhdCBuZWVkcyBubyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxuICpcbiAqIENvbW1vbiB1c2VzIG9mIHRoaXMgc3RydWN0dXJlIGluY2x1ZGVzIG1vZGVsbGluZyB2YWx1ZXMgdGhhdCBtYXkgb3IgbWF5XG4gKiBub3QgYmUgcHJlc2VudCBpbiBhIGNvbGxlY3Rpb24sIHRodXMgaW5zdGVhZCBvZiBuZWVkaW5nIGFcbiAqIGBjb2xsZWN0aW9uLmhhcyhhKWAsIHRoZSBgY29sbGVjdGlvbi5nZXQoYSlgIG9wZXJhdGlvbiBnaXZlcyB5b3UgYWxsXG4gKiB0aGUgaW5mb3JtYXRpb24geW91IG5lZWQg4oCUIGBjb2xsZWN0aW9uLmdldChhKS5pcy1ub3RoaW5nYCBiZWluZ1xuICogZXF1aXZhbGVudCB0byBgY29sbGVjdGlvbi5oYXMoYSlgOyBTaW1pbGFybHkgdGhlIHNhbWUgcmVhc29uaW5nIG1heVxuICogYmUgYXBwbGllZCB0byBjb21wdXRhdGlvbnMgdGhhdCBtYXkgZmFpbCB0byBwcm92aWRlIGEgdmFsdWUsIGUuZy46XG4gKiBgY29sbGVjdGlvbi5maW5kKHByZWRpY2F0ZSlgIGNhbiBzYWZlbHkgcmV0dXJuIGEgYE1heWJlKGEpYCBpbnN0YW5jZSxcbiAqIGV2ZW4gaWYgdGhlIGNvbGxlY3Rpb24gY29udGFpbnMgbnVsbGFibGUgdmFsdWVzLlxuICpcbiAqIEZ1cnRoZXJtb3JlLCB0aGUgdmFsdWVzIG9mIGBNYXliZShhKWAgY2FuIGJlIGNvbWJpbmVkIGFuZCBtYW5pcHVsYXRlZFxuICogYnkgdXNpbmcgdGhlIGV4cHJlc3NpdmUgbW9uYWRpYyBvcGVyYXRpb25zLiBUaGlzIGFsbG93cyBzYWZlbHlcbiAqIHNlcXVlbmNpbmcgb3BlcmF0aW9ucyB0aGF0IG1heSBmYWlsLCBhbmQgc2FmZWx5IGNvbXBvc2luZyB2YWx1ZXMgdGhhdFxuICogeW91IGRvbid0IGtub3cgd2hldGhlciB0aGV5J3JlIHByZXNlbnQgb3Igbm90LCBmYWlsaW5nIGVhcmx5XG4gKiAocmV0dXJuaW5nIGEgYE5vdGhpbmdgKSBpZiBhbnkgb2YgdGhlIG9wZXJhdGlvbnMgZmFpbC5cbiAqXG4gKiBJZiBvbmUgd2FudHMgdG8gc3RvcmUgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiBhYm91dCBmYWlsdXJlcywgdGhlXG4gKiBbRWl0aGVyXVtdIGFuZCBbVmFsaWRhdGlvbl1bXSBzdHJ1Y3R1cmVzIHByb3ZpZGUgc3VjaCBhIGNhcGFiaWxpdHksIGFuZFxuICogc2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBvZiB0aGUgYE1heWJlKGEpYCBzdHJ1Y3R1cmUuXG4gKlxuICogW0VpdGhlcl06IGh0dHBzOi8vZ2l0aHViLmNvbS9mb2xrdGFsZS9kYXRhLmVpdGhlclxuICogW1ZhbGlkYXRpb25dOiBodHRwczovL2dpdGh1Yi5jb20vZm9sa3RhbGUvZGF0YS52YWxpZGF0aW9uXG4gKlxuICpcbiAqIEBjbGFzc1xuICovXG5leHBvcnQgZnVuY3Rpb24gTWF5YmUoKSB7XG59XG5cbi8vIFRoZSBjYXNlIGZvciBzdWNjZXNzZnVsIHZhbHVlc1xuSnVzdC5wcm90b3R5cGUgPSBjbG9uZShNYXliZS5wcm90b3R5cGUpO1xuZnVuY3Rpb24gSnVzdChhKSB7XG4gICAgdGhpcy52YWx1ZSA9IGE7XG59XG5cbi8vIFRoZSBjYXNlIGZvciBmYWlsdXJlIHZhbHVlc1xuTm90aGluZy5wcm90b3R5cGUgPSBjbG9uZShNYXliZS5wcm90b3R5cGUpO1xuZnVuY3Rpb24gTm90aGluZygpIHtcbn1cblxuXG4vLyAtLSBDb25zdHJ1Y3RvcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgbmV3IGBNYXliZVvOsV1gIHN0cnVjdHVyZSB3aXRoIGFuIGFic2VudCB2YWx1ZS4gQ29tbW9ubHkgdXNlZFxuICogdG8gcmVwcmVzZW50IGEgZmFpbHVyZS5cbiAqXG4gKiBAc3VtbWFyeSBWb2lkIOKGkiBNYXliZVvOsV1cbiAqL1xuTWF5YmUuTm90aGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IE5vdGhpbmc7XG59O1xuTWF5YmUucHJvdG90eXBlLk5vdGhpbmcgPSBNYXliZS5Ob3RoaW5nO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgYE1heWJlW86xXWAgc3RydWN0dXJlIHRoYXQgaG9sZHMgdGhlIHNpbmdsZSB2YWx1ZVxuICogYM6xYC4gQ29tbW9ubHkgdXNlZCB0byByZXByZXNlbnQgYSBzdWNjZXNzLlxuICpcbiAqIGDOsWAgY2FuIGJlIGFueSB2YWx1ZSwgaW5jbHVkaW5nIGBudWxsYCwgYHVuZGVmaW5lZGAgb3IgYW5vdGhlclxuICogYE1heWJlW86xXWAgc3RydWN0dXJlLlxuICpcbiAqIEBzdW1tYXJ5IM6xIOKGkiBNYXliZVvOsV1cbiAqL1xuTWF5YmUuSnVzdCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIG5ldyBKdXN0KGEpO1xufTtcbk1heWJlLnByb3RvdHlwZS5KdXN0ID0gTWF5YmUuSnVzdDtcblxuXG4vLyAtLSBDb252ZXJzaW9ucyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgbmV3IGBNYXliZVvOsV1gIHN0cnVjdHVyZSBmcm9tIGEgbnVsbGFibGUgdHlwZS5cbiAqXG4gKiBJZiB0aGUgdmFsdWUgaXMgZWl0aGVyIGBudWxsYCBvciBgdW5kZWZpbmVkYCwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIGFcbiAqIGBOb3RoaW5nYCwgb3RoZXJ3aXNlIHRoZSB2YWx1ZSBpcyB3cmFwcGVkIGluIGEgYEp1c3QozrEpYC5cbiAqXG4gKiBAc3VtbWFyeSDOsSDihpIgTWF5YmVbzrFdXG4gKi9cbk1heWJlLmZyb21OdWxsYWJsZSA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIChhICE9PSBudWxsKSA/IG5ldyBKdXN0KGEpXG4gICAgICAgIDogLyogb3RoZXJ3aXNlICovICBuZXcgTm90aGluZztcbn07XG5NYXliZS5wcm90b3R5cGUuZnJvbU51bGxhYmxlID0gTWF5YmUuZnJvbU51bGxhYmxlO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgYE1heWJlW86yXWAgc3RydWN0dXJlIGZyb20gYW4gYEVpdGhlclvOsSwgzrJdYCB0eXBlLlxuICpcbiAqIFRoZSBsZWZ0IHNpZGUgb2YgdGhlIGBFaXRoZXJgIGJlY29tZXMgYE5vdGhpbmdgLCBhbmQgdGhlIHJpZ2h0IHNpZGVcbiAqIGlzIHdyYXBwZWQgaW4gYSBgSnVzdCjOsilgLlxuICpcbiAqIEBzdW1tYXJ5IEVpdGhlclvOsSwgzrJdIOKGkiBNYXliZVvOsl1cbiAqL1xuTWF5YmUuZnJvbUVpdGhlciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGEuZm9sZChNYXliZS5Ob3RoaW5nLCBNYXliZS5KdXN0KTtcbn07XG5NYXliZS5wcm90b3R5cGUuZnJvbUVpdGhlciA9IE1heWJlLmZyb21FaXRoZXI7XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIG5ldyBgTWF5YmVbzrJdYCBzdHJ1Y3R1cmUgZnJvbSBhIGBWYWxpZGF0aW9uW86xLCDOsl1gIHR5cGUuXG4gKlxuICogVGhlIGZhaWx1cmUgc2lkZSBvZiB0aGUgYFZhbGlkYXRpb25gIGJlY29tZXMgYE5vdGhpbmdgLCBhbmQgdGhlIHJpZ2h0XG4gKiBzaWRlIGlzIHdyYXBwZWQgaW4gYSBgSnVzdCjOsilgLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IFZhbGlkYXRpb25bzrEsIM6yXSDihpIgTWF5YmVbzrJdXG4gKi9cbk1heWJlLmZyb21WYWxpZGF0aW9uID0gTWF5YmUuZnJvbUVpdGhlcjtcbk1heWJlLnByb3RvdHlwZS5mcm9tVmFsaWRhdGlvbiA9IE1heWJlLmZyb21FaXRoZXI7XG5cblxuLy8gLS0gUHJlZGljYXRlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogVHJ1ZSBpZiB0aGUgYE1heWJlW86xXWAgc3RydWN0dXJlIGNvbnRhaW5zIGEgZmFpbHVyZSAoaS5lLjogYE5vdGhpbmdgKS5cbiAqXG4gKiBAc3VtbWFyeSBCb29sZWFuXG4gKi9cbk1heWJlLnByb3RvdHlwZS5pc05vdGhpbmcgPSBmYWxzZTtcbk5vdGhpbmcucHJvdG90eXBlLmlzTm90aGluZyA9IHRydWU7XG5cblxuLyoqXG4gKiBUcnVlIGlmIHRoZSBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUgY29udGFpbnMgYSBzaW5nbGUgdmFsdWUgKGkuZS46IGBKdXN0KM6xKWApLlxuICpcbiAqIEBzdW1tYXJ5IEJvb2xlYW5cbiAqL1xuTWF5YmUucHJvdG90eXBlLmlzSnVzdCA9IGZhbHNlO1xuSnVzdC5wcm90b3R5cGUuaXNKdXN0ID0gdHJ1ZTtcblxuXG4vLyAtLSBBcHBsaWNhdGl2ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBNYXliZVvOsV1gIHN0cnVjdHVyZSBob2xkaW5nIHRoZSBzaW5nbGUgdmFsdWUgYM6xYC5cbiAqXG4gKiBgzrFgIGNhbiBiZSBhbnkgdmFsdWUsIGluY2x1ZGluZyBgbnVsbGAsIGB1bmRlZmluZWRgLCBvciBhbm90aGVyXG4gKiBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUuXG4gKlxuICogQHN1bW1hcnkgzrEg4oaSIE1heWJlW86xXVxuICovXG5NYXliZS5vZiA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIG5ldyBKdXN0KGEpO1xufTtcbk1heWJlLnByb3RvdHlwZS5vZiA9IE1heWJlLm9mO1xuXG5cbi8qKlxuICogQXBwbGllcyB0aGUgZnVuY3Rpb24gaW5zaWRlIHRoZSBgTWF5YmVbzrFdYCBzdHJ1Y3R1cmUgdG8gYW5vdGhlclxuICogYXBwbGljYXRpdmUgdHlwZS5cbiAqXG4gKiBUaGUgYE1heWJlW86xXWAgc3RydWN0dXJlIHNob3VsZCBjb250YWluIGEgZnVuY3Rpb24gdmFsdWUsIG90aGVyd2lzZSBhXG4gKiBgVHlwZUVycm9yYCBpcyB0aHJvd24uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBNYXliZVvOsSDihpIgzrJdLCBmOkFwcGxpY2F0aXZlW19dKSA9PiBmW86xXSDihpIgZlvOsl1cbiAqL1xuTWF5YmUucHJvdG90eXBlLmFwID0gdW5pbXBsZW1lbnRlZDtcblxuTm90aGluZy5wcm90b3R5cGUuYXAgPSBub29wO1xuXG5KdXN0LnByb3RvdHlwZS5hcCA9IGZ1bmN0aW9uIChiKSB7XG4gICAgcmV0dXJuIGIubWFwKHRoaXMudmFsdWUpO1xufTtcblxuXG4vLyAtLSBGdW5jdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2YWx1ZSBvZiB0aGUgYE1heWJlW86xXWAgc3RydWN0dXJlIHVzaW5nIGEgcmVndWxhciB1bmFyeVxuICogZnVuY3Rpb24uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgQE1heWJlW86xXSA9PiAozrEg4oaSIM6yKSDihpIgTWF5YmVbzrJdXG4gKi9cbk1heWJlLnByb3RvdHlwZS5tYXAgPSB1bmltcGxlbWVudGVkO1xuTm90aGluZy5wcm90b3R5cGUubWFwID0gbm9vcDtcblxuSnVzdC5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24gKGYpIHtcbiAgICByZXR1cm4gdGhpcy5vZihmKHRoaXMudmFsdWUpKTtcbn07XG5cblxuLy8gLS0gQ2hhaW4gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmFsdWUgb2YgdGhlIGBNYXliZVvOsV1gIHN0cnVjdHVyZSB1c2luZyBhbiB1bmFyeSBmdW5jdGlvblxuICogdG8gbW9uYWRzLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChATWF5YmVbzrFdLCBtOk1vbmFkW19dKSA9PiAozrEg4oaSIG1bzrJdKSDihpIgbVvOsl1cbiAqL1xuTWF5YmUucHJvdG90eXBlLmNoYWluID0gdW5pbXBsZW1lbnRlZDtcbk5vdGhpbmcucHJvdG90eXBlLmNoYWluID0gbm9vcDtcblxuSnVzdC5wcm90b3R5cGUuY2hhaW4gPSBmdW5jdGlvbiAoZikge1xuICAgIHJldHVybiBmKHRoaXMudmFsdWUpO1xufTtcblxuXG4vLyAtLSBTaG93IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZXR1cm5zIGEgdGV4dHVhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgYE1heWJlW86xXWAgc3RydWN0dXJlLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IEBNYXliZVvOsV0gPT4gVm9pZCDihpIgU3RyaW5nXG4gKi9cbk1heWJlLnByb3RvdHlwZS50b1N0cmluZyA9IHVuaW1wbGVtZW50ZWQ7XG5cbk5vdGhpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnTWF5YmUuTm90aGluZyc7XG59O1xuXG5KdXN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ01heWJlLkp1c3QoJyArIHRoaXMudmFsdWUgKyAnKSc7XG59O1xuXG5cbi8vIC0tIEVxIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRlc3RzIGlmIGEgYE1heWJlW86xXWAgc3RydWN0dXJlIGlzIGVxdWFsIHRvIGFub3RoZXIgYE1heWJlW86xXWAgc3RydWN0dXJlLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IEBNYXliZVvOsV0gPT4gTWF5YmVbzrFdIOKGkiBCb29sZWFuXG4gKi9cbk1heWJlLnByb3RvdHlwZS5pc0VxdWFsID0gdW5pbXBsZW1lbnRlZDtcblxuTm90aGluZy5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uIChiKSB7XG4gICAgcmV0dXJuIGIuaXNOb3RoaW5nO1xufTtcblxuSnVzdC5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uIChiKSB7XG4gICAgcmV0dXJuIGIuaXNKdXN0XG4gICAgICAgICYmIGIudmFsdWUgPT09IHRoaXMudmFsdWU7XG59O1xuXG5cbi8vIC0tIEV4dHJhY3RpbmcgYW5kIHJlY292ZXJpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSB2YWx1ZSBvdXQgb2YgdGhlIGBNYXliZVvOsV1gIHN0cnVjdHVyZSwgaWYgaXRcbiAqIGV4aXN0cy4gT3RoZXJ3aXNlIHRocm93cyBhIGBUeXBlRXJyb3JgLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IEBNYXliZVvOsV0gPT4gVm9pZCDihpIgYSwgICAgICA6OiBwYXJ0aWFsLCB0aHJvd3NcbiAqIEBzZWUge0BsaW5rIG1vZHVsZTpsaWIvbWF5YmV+TWF5YmUjZ2V0T3JFbHNlfSDigJQgQSBnZXR0ZXIgdGhhdCBjYW4gaGFuZGxlIGZhaWx1cmVzXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IGlmIHRoZSBzdHJ1Y3R1cmUgaGFzIG5vIHZhbHVlIChgTm90aGluZ2ApLlxuICovXG5NYXliZS5wcm90b3R5cGUuZ2V0ID0gdW5pbXBsZW1lbnRlZDtcblxuTm90aGluZy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NhblxcJ3QgZXh0cmFjdCB0aGUgdmFsdWUgb2YgYSBOb3RoaW5nLicpO1xufTtcblxuSnVzdC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xufTtcblxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSB2YWx1ZSBvdXQgb2YgdGhlIGBNYXliZVvOsV1gIHN0cnVjdHVyZS4gSWYgdGhlcmUgaXMgbm8gdmFsdWUsXG4gKiByZXR1cm5zIHRoZSBnaXZlbiBkZWZhdWx0LlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IEBNYXliZVvOsV0gPT4gzrEg4oaSIM6xXG4gKi9cbk1heWJlLnByb3RvdHlwZS5nZXRPckVsc2UgPSB1bmltcGxlbWVudGVkO1xuXG5Ob3RoaW5nLnByb3RvdHlwZS5nZXRPckVsc2UgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBhO1xufTtcblxuSnVzdC5wcm90b3R5cGUuZ2V0T3JFbHNlID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgZmFpbHVyZSBpbnRvIGEgbmV3IGBNYXliZVvOsV1gIHN0cnVjdHVyZS4gRG9lcyBub3RoaW5nIGlmIHRoZVxuICogc3RydWN0dXJlIGFscmVhZHkgY29udGFpbnMgYSB2YWx1ZS5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSBATWF5YmVbzrFdID0+IChWb2lkIOKGkiBNYXliZVvOsV0pIOKGkiBNYXliZVvOsV1cbiAqL1xuTWF5YmUucHJvdG90eXBlLm9yRWxzZSA9IHVuaW1wbGVtZW50ZWQ7XG5cbk5vdGhpbmcucHJvdG90eXBlLm9yRWxzZSA9IGZ1bmN0aW9uIChmKSB7XG4gICAgcmV0dXJuIGYoKTtcbn07XG5cbkp1c3QucHJvdG90eXBlLm9yRWxzZSA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5cbi8qKlxuICogQ2F0YW1vcnBoaXNtLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IEBNYXliZVvOsV0gPT4geyBOb3RoaW5nOiBWb2lkIOKGkiDOsiwgSnVzdDogzrEg4oaSIM6yIH0g4oaSIM6yXG4gKi9cbk1heWJlLnByb3RvdHlwZS5jYXRhID0gdW5pbXBsZW1lbnRlZDtcblxuTm90aGluZy5wcm90b3R5cGUuY2F0YSA9IGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gICAgcmV0dXJuIHBhdHRlcm4uTm90aGluZygpO1xufTtcblxuSnVzdC5wcm90b3R5cGUuY2F0YSA9IGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gICAgcmV0dXJuIHBhdHRlcm4uSnVzdCh0aGlzLnZhbHVlKTtcbn07XG5cblxuLyoqXG4gKiBKU09OIHNlcmlhbGlzYXRpb25cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSBATWF5YmVbzrFdID0+IFZvaWQg4oaSIE9iamVjdFxuICovXG5NYXliZS5wcm90b3R5cGUudG9KU09OID0gdW5pbXBsZW1lbnRlZDtcblxuTm90aGluZy5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7JyN0eXBlJzogJ2ZvbGt0YWxlOk1heWJlLk5vdGhpbmcnfTtcbn07XG5cbkp1c3QucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAnI3R5cGUnOiAnZm9sa3RhbGU6TWF5YmUuSnVzdCdcbiAgICAgICAgLCB2YWx1ZTogdGhpcy52YWx1ZVxuICAgIH07XG59O1xuIl19