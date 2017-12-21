define(['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Validation = Validation;
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
     * @module lib/validation
     */
    //module.exports = Validation

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
     * The `Validation[α, β]` is a disjunction that's more appropriate for
     * validating inputs, or any use case where you want to aggregate failures. Not
     * only does the `Validation` provide a better terminology for working with
     * such cases (`Failure` and `Success` versus `Failure` and `Success`), it also
     * allows one to easily aggregate failures and successes as an Applicative
     * Functor.
     *
     * @class
     * @summary
     * Validation[α, β] <: Applicative[β]
     *                   , Functor[β]
     *                   , Show
     *                   , Eq
     */
    function Validation() {}

    Failure.prototype = clone(Validation.prototype);
    function Failure(a) {
        this.value = a;
    }

    Success.prototype = clone(Validation.prototype);
    function Success(a) {
        this.value = a;
    }

    // -- Constructors -----------------------------------------------------

    /**
     * Constructs a new `Validation[α, β]` structure holding a `Failure` value.
     *
     * @summary a → Validation[α, β]
     */
    Validation.Failure = function (a) {
        return new Failure(a);
    };
    Validation.prototype.Failure = Validation.Failure;

    /**
     * Constructs a new `Etiher[α, β]` structure holding a `Success` value.
     *
     * @summary β → Validation[α, β]
     */
    Validation.Success = function (a) {
        return new Success(a);
    };
    Validation.prototype.Success = Validation.Success;

    // -- Conversions ------------------------------------------------------

    /**
     * Constructs a new `Validation[α, β]` structure from a nullable type.
     *
     * Takes the `Failure` case if the value is `null` or `undefined`. Takes the
     * `Success` case otherwise.
     *
     * @summary α → Validation[α, α]
     */
    Validation.fromNullable = function (a) {
        return a !== null ? new Success(a) : /* otherwise */new Failure(a);
    };
    Validation.prototype.fromNullable = Validation.fromNullable;

    /**
     * Constructs a new `Either[α, β]` structure from a `Validation[α, β]` type.
     *
     * @summary Either[α, β] → Validation[α, β]
     */
    Validation.fromEither = function (a) {
        return a.fold(Validation.Failure, Validation.Success);
    };

    // -- Predicates -------------------------------------------------------

    /**
     * True if the `Validation[α, β]` contains a `Failure` value.
     *
     * @summary Boolean
     */
    Validation.prototype.isFailure = false;
    Failure.prototype.isFailure = true;

    /**
     * True if the `Validation[α, β]` contains a `Success` value.
     *
     * @summary Boolean
     */
    Validation.prototype.isSuccess = false;
    Success.prototype.isSuccess = true;

    // -- Applicative ------------------------------------------------------

    /**
     * Creates a new `Validation[α, β]` instance holding the `Success` value `b`.
     *
     * `b` can be any value, including `null`, `undefined` or another
     * `Validation[α, β]` structure.
     *
     * @summary β → Validation[α, β]
     */
    Validation.of = function (a) {
        return new Success(a);
    };
    Validation.prototype.of = Validation.of;

    /**
     * Applies the function inside the `Success` case of the `Validation[α, β]` structure
     * to another applicative type.
     *
     * The `Validation[α, β]` should contain a function value, otherwise a `TypeError`
     * is thrown.
     *
     * @method
     * @summary (@Validation[α, β → γ], f:Applicative[_]) => f[β] → f[γ]
     */
    Validation.prototype.ap = unimplemented;

    Failure.prototype.ap = function (b) {
        return b.isFailure ? this.Failure(this.value.concat(b.value)) : /* otherwise */this;
    };

    Success.prototype.ap = function (b) {
        return b.isFailure ? b : /* otherwise */b.map(this.value);
    };

    // -- Functor ----------------------------------------------------------

    /**
     * Transforms the `Success` value of the `Validation[α, β]` structure using a regular
     * unary function.
     *
     * @method
     * @summary (@Validation[α, β]) => (β → γ) → Validation[α, γ]
     */
    Validation.prototype.map = unimplemented;
    Failure.prototype.map = noop;

    Success.prototype.map = function (f) {
        return this.of(f(this.value));
    };

    // -- Show -------------------------------------------------------------

    /**
     * Returns a textual representation of the `Validation[α, β]` structure.
     *
     * @method
     * @summary (@Validation[α, β]) => Void → String
     */
    Validation.prototype.toString = unimplemented;

    Failure.prototype.toString = function () {
        return 'Validation.Failure(' + this.value + ')';
    };

    Success.prototype.toString = function () {
        return 'Validation.Success(' + this.value + ')';
    };

    // -- Eq ---------------------------------------------------------------

    /**
     * Tests if an `Validation[α, β]` structure is equal to another `Validation[α, β]`
     * structure.
     *
     * @method
     * @summary (@Validation[α, β]) => Validation[α, β] → Boolean
     */
    Validation.prototype.isEqual = unimplemented;

    Failure.prototype.isEqual = function (a) {
        return a.isFailure && a.value === this.value;
    };

    Success.prototype.isEqual = function (a) {
        return a.isSuccess && a.value === this.value;
    };

    // -- Extracting and recovering ----------------------------------------

    /**
     * Extracts the `Success` value out of the `Validation[α, β]` structure, if it
     * exists. Otherwise throws a `TypeError`.
     *
     * @method
     * @summary (@Validation[α, β]) => Void → β         :: partial, throws
     * @see {@link module:lib/validation~Validation#getOrElse} — A getter that can handle failures.
     * @see {@link module:lib/validation~Validation#merge} — The convergence of both values.
     * @throws {TypeError} if the structure has no `Success` value.
     */
    Validation.prototype.get = unimplemented;

    Failure.prototype.get = function () {
        throw new TypeError('Can\'t extract the value of a Failure(a).');
    };

    Success.prototype.get = function () {
        return this.value;
    };

    /**
     * Extracts the `Success` value out of the `Validation[α, β]` structure. If the
     * structure doesn't have a `Success` value, returns the given default.
     *
     * @method
     * @summary (@Validation[α, β]) => β → β
     */
    Validation.prototype.getOrElse = unimplemented;

    Failure.prototype.getOrElse = function (a) {
        return a;
    };

    Success.prototype.getOrElse = function (_) {
        return this.value;
    };

    /**
     * Transforms a `Failure` value into a new `Validation[α, β]` structure. Does nothing
     * if the structure contain a `Success` value.
     *
     * @method
     * @summary (@Validation[α, β]) => (α → Validation[γ, β]) → Validation[γ, β]
     */
    Validation.prototype.orElse = unimplemented;
    Success.prototype.orElse = noop;

    Failure.prototype.orElse = function (f) {
        return f(this.value);
    };

    /**
     * Returns the value of whichever side of the disjunction that is present.
     *
     * @summary (@Validation[α, α]) => Void → α
     */
    Validation.prototype.merge = function () {
        return this.value;
    };

    // -- Folds and Extended Transformations -------------------------------

    /**
     * Applies a function to each case in this data structure.
     *
     * @method
     * @summary (@Validation[α, β]) => (α → γ), (β → γ) → γ
     */
    Validation.prototype.fold = unimplemented;

    Failure.prototype.fold = function (f, _) {
        return f(this.value);
    };

    Success.prototype.fold = function (_, g) {
        return g(this.value);
    };

    /**
     * Catamorphism.
     *
     * @method
     * @summary (@Validation[α, β]) => { Success: α → γ, Failure: α → γ } → γ
     */
    Validation.prototype.cata = unimplemented;

    Failure.prototype.cata = function (pattern) {
        return pattern.Failure(this.value);
    };

    Success.prototype.cata = function (pattern) {
        return pattern.Success(this.value);
    };

    /**
     * Swaps the disjunction values.
     *
     * @method
     * @summary (@Validation[α, β]) => Void → Validation[β, α]
     */
    Validation.prototype.swap = unimplemented;

    Failure.prototype.swap = function () {
        return this.Success(this.value);
    };

    Success.prototype.swap = function () {
        return this.Failure(this.value);
    };

    /**
     * Maps both sides of the disjunction.
     *
     * @method
     * @summary (@Validation[α, β]) => (α → γ), (β → δ) → Validation[γ, δ]
     */
    Validation.prototype.bimap = unimplemented;

    Failure.prototype.bimap = function (f, _) {
        return this.Failure(f(this.value));
    };

    Success.prototype.bimap = function (_, g) {
        return this.Success(g(this.value));
    };

    /**
     * Maps the failure side of the disjunction.
     *
     * @method
     * @summary (@Validation[α, β]) => (α → γ) → Validation[γ, β]
     */
    Validation.prototype.failureMap = unimplemented;
    Success.prototype.failureMap = noop;

    Failure.prototype.failureMap = function (f) {
        return this.Failure(f(this.value));
    };

    /**
     * Maps the failure side of the disjunction.
     *
     * @method
     * @deprecated in favour of {@link module:lib/validation~Validation#failureMap}
     * @summary (@Validation[α, β]) => (α → γ) → Validation[γ, β]
     */
    Validation.prototype.leftMap = Validation.prototype.failureMap;
    Success.prototype.leftMap = Success.prototype.failureMap;
    Failure.prototype.leftMap = Failure.prototype.failureMap;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3ZhbGlkYXRpb24uanMiXSwibmFtZXMiOlsiVmFsaWRhdGlvbiIsImNsb25lIiwiT2JqZWN0IiwiY3JlYXRlIiwidW5pbXBsZW1lbnRlZCIsIkVycm9yIiwibm9vcCIsIkZhaWx1cmUiLCJwcm90b3R5cGUiLCJhIiwidmFsdWUiLCJTdWNjZXNzIiwiZnJvbU51bGxhYmxlIiwiZnJvbUVpdGhlciIsImZvbGQiLCJpc0ZhaWx1cmUiLCJpc1N1Y2Nlc3MiLCJvZiIsImFwIiwiYiIsImNvbmNhdCIsIm1hcCIsImYiLCJ0b1N0cmluZyIsImlzRXF1YWwiLCJnZXQiLCJUeXBlRXJyb3IiLCJnZXRPckVsc2UiLCJfIiwib3JFbHNlIiwibWVyZ2UiLCJnIiwiY2F0YSIsInBhdHRlcm4iLCJzd2FwIiwiYmltYXAiLCJmYWlsdXJlTWFwIiwibGVmdE1hcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1lBcURnQkEsVSxHQUFBQSxVO0FBckRoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTs7QUFFQTtBQUNBLFFBQU1DLFFBQVFDLE9BQU9DLE1BQXJCO0FBQ0EsUUFBTUMsZ0JBQWdCLFNBQWhCQSxhQUFnQixHQUFZO0FBQzlCLGNBQU0sSUFBSUMsS0FBSixDQUFVLGtCQUFWLENBQU47QUFDSCxLQUZEO0FBR0EsUUFBTUMsT0FBTyxTQUFQQSxJQUFPLEdBQVk7QUFDckIsZUFBTyxJQUFQO0FBQ0gsS0FGRDs7QUFLQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7O0FBZU8sYUFBU04sVUFBVCxHQUFzQixDQUM1Qjs7QUFFRE8sWUFBUUMsU0FBUixHQUFvQlAsTUFBTUQsV0FBV1EsU0FBakIsQ0FBcEI7QUFDQSxhQUFTRCxPQUFULENBQWlCRSxDQUFqQixFQUFvQjtBQUNoQixhQUFLQyxLQUFMLEdBQWFELENBQWI7QUFDSDs7QUFFREUsWUFBUUgsU0FBUixHQUFvQlAsTUFBTUQsV0FBV1EsU0FBakIsQ0FBcEI7QUFDQSxhQUFTRyxPQUFULENBQWlCRixDQUFqQixFQUFvQjtBQUNoQixhQUFLQyxLQUFMLEdBQWFELENBQWI7QUFDSDs7QUFFRDs7QUFFQTs7Ozs7QUFLQVQsZUFBV08sT0FBWCxHQUFxQixVQUFVRSxDQUFWLEVBQWE7QUFDOUIsZUFBTyxJQUFJRixPQUFKLENBQVlFLENBQVosQ0FBUDtBQUNILEtBRkQ7QUFHQVQsZUFBV1EsU0FBWCxDQUFxQkQsT0FBckIsR0FBK0JQLFdBQVdPLE9BQTFDOztBQUVBOzs7OztBQUtBUCxlQUFXVyxPQUFYLEdBQXFCLFVBQVVGLENBQVYsRUFBYTtBQUM5QixlQUFPLElBQUlFLE9BQUosQ0FBWUYsQ0FBWixDQUFQO0FBQ0gsS0FGRDtBQUdBVCxlQUFXUSxTQUFYLENBQXFCRyxPQUFyQixHQUErQlgsV0FBV1csT0FBMUM7O0FBR0E7O0FBRUE7Ozs7Ozs7O0FBUUFYLGVBQVdZLFlBQVgsR0FBMEIsVUFBVUgsQ0FBVixFQUFhO0FBQ25DLGVBQVFBLE1BQU0sSUFBUCxHQUFlLElBQUlFLE9BQUosQ0FBWUYsQ0FBWixDQUFmLEdBQ0QsZUFBaUIsSUFBSUYsT0FBSixDQUFZRSxDQUFaLENBRHZCO0FBRUgsS0FIRDtBQUlBVCxlQUFXUSxTQUFYLENBQXFCSSxZQUFyQixHQUFvQ1osV0FBV1ksWUFBL0M7O0FBRUE7Ozs7O0FBS0FaLGVBQVdhLFVBQVgsR0FBd0IsVUFBVUosQ0FBVixFQUFhO0FBQ2pDLGVBQU9BLEVBQUVLLElBQUYsQ0FBT2QsV0FBV08sT0FBbEIsRUFBMkJQLFdBQVdXLE9BQXRDLENBQVA7QUFDSCxLQUZEOztBQUtBOztBQUVBOzs7OztBQUtBWCxlQUFXUSxTQUFYLENBQXFCTyxTQUFyQixHQUFpQyxLQUFqQztBQUNBUixZQUFRQyxTQUFSLENBQWtCTyxTQUFsQixHQUE4QixJQUE5Qjs7QUFFQTs7Ozs7QUFLQWYsZUFBV1EsU0FBWCxDQUFxQlEsU0FBckIsR0FBaUMsS0FBakM7QUFDQUwsWUFBUUgsU0FBUixDQUFrQlEsU0FBbEIsR0FBOEIsSUFBOUI7O0FBR0E7O0FBRUE7Ozs7Ozs7O0FBUUFoQixlQUFXaUIsRUFBWCxHQUFnQixVQUFVUixDQUFWLEVBQWE7QUFDekIsZUFBTyxJQUFJRSxPQUFKLENBQVlGLENBQVosQ0FBUDtBQUNILEtBRkQ7QUFHQVQsZUFBV1EsU0FBWCxDQUFxQlMsRUFBckIsR0FBMEJqQixXQUFXaUIsRUFBckM7O0FBR0E7Ozs7Ozs7Ozs7QUFVQWpCLGVBQVdRLFNBQVgsQ0FBcUJVLEVBQXJCLEdBQTBCZCxhQUExQjs7QUFFQUcsWUFBUUMsU0FBUixDQUFrQlUsRUFBbEIsR0FBdUIsVUFBVUMsQ0FBVixFQUFhO0FBQ2hDLGVBQU9BLEVBQUVKLFNBQUYsR0FBYyxLQUFLUixPQUFMLENBQWEsS0FBS0csS0FBTCxDQUFXVSxNQUFYLENBQWtCRCxFQUFFVCxLQUFwQixDQUFiLENBQWQsR0FDRCxlQUFpQixJQUR2QjtBQUVILEtBSEQ7O0FBS0FDLFlBQVFILFNBQVIsQ0FBa0JVLEVBQWxCLEdBQXVCLFVBQVVDLENBQVYsRUFBYTtBQUNoQyxlQUFPQSxFQUFFSixTQUFGLEdBQWNJLENBQWQsR0FDRCxlQUFpQkEsRUFBRUUsR0FBRixDQUFNLEtBQUtYLEtBQVgsQ0FEdkI7QUFFSCxLQUhEOztBQU1BOztBQUVBOzs7Ozs7O0FBT0FWLGVBQVdRLFNBQVgsQ0FBcUJhLEdBQXJCLEdBQTJCakIsYUFBM0I7QUFDQUcsWUFBUUMsU0FBUixDQUFrQmEsR0FBbEIsR0FBd0JmLElBQXhCOztBQUVBSyxZQUFRSCxTQUFSLENBQWtCYSxHQUFsQixHQUF3QixVQUFVQyxDQUFWLEVBQWE7QUFDakMsZUFBTyxLQUFLTCxFQUFMLENBQVFLLEVBQUUsS0FBS1osS0FBUCxDQUFSLENBQVA7QUFDSCxLQUZEOztBQUtBOztBQUVBOzs7Ozs7QUFNQVYsZUFBV1EsU0FBWCxDQUFxQmUsUUFBckIsR0FBZ0NuQixhQUFoQzs7QUFFQUcsWUFBUUMsU0FBUixDQUFrQmUsUUFBbEIsR0FBNkIsWUFBWTtBQUNyQyxlQUFPLHdCQUF3QixLQUFLYixLQUE3QixHQUFxQyxHQUE1QztBQUNILEtBRkQ7O0FBSUFDLFlBQVFILFNBQVIsQ0FBa0JlLFFBQWxCLEdBQTZCLFlBQVk7QUFDckMsZUFBTyx3QkFBd0IsS0FBS2IsS0FBN0IsR0FBcUMsR0FBNUM7QUFDSCxLQUZEOztBQUtBOztBQUVBOzs7Ozs7O0FBT0FWLGVBQVdRLFNBQVgsQ0FBcUJnQixPQUFyQixHQUErQnBCLGFBQS9COztBQUVBRyxZQUFRQyxTQUFSLENBQWtCZ0IsT0FBbEIsR0FBNEIsVUFBVWYsQ0FBVixFQUFhO0FBQ3JDLGVBQU9BLEVBQUVNLFNBQUYsSUFBZ0JOLEVBQUVDLEtBQUYsS0FBWSxLQUFLQSxLQUF4QztBQUNILEtBRkQ7O0FBSUFDLFlBQVFILFNBQVIsQ0FBa0JnQixPQUFsQixHQUE0QixVQUFVZixDQUFWLEVBQWE7QUFDckMsZUFBT0EsRUFBRU8sU0FBRixJQUFnQlAsRUFBRUMsS0FBRixLQUFZLEtBQUtBLEtBQXhDO0FBQ0gsS0FGRDs7QUFLQTs7QUFFQTs7Ozs7Ozs7OztBQVVBVixlQUFXUSxTQUFYLENBQXFCaUIsR0FBckIsR0FBMkJyQixhQUEzQjs7QUFFQUcsWUFBUUMsU0FBUixDQUFrQmlCLEdBQWxCLEdBQXdCLFlBQVk7QUFDaEMsY0FBTSxJQUFJQyxTQUFKLENBQWMsMkNBQWQsQ0FBTjtBQUNILEtBRkQ7O0FBSUFmLFlBQVFILFNBQVIsQ0FBa0JpQixHQUFsQixHQUF3QixZQUFZO0FBQ2hDLGVBQU8sS0FBS2YsS0FBWjtBQUNILEtBRkQ7O0FBS0E7Ozs7Ozs7QUFPQVYsZUFBV1EsU0FBWCxDQUFxQm1CLFNBQXJCLEdBQWlDdkIsYUFBakM7O0FBRUFHLFlBQVFDLFNBQVIsQ0FBa0JtQixTQUFsQixHQUE4QixVQUFVbEIsQ0FBVixFQUFhO0FBQ3ZDLGVBQU9BLENBQVA7QUFDSCxLQUZEOztBQUlBRSxZQUFRSCxTQUFSLENBQWtCbUIsU0FBbEIsR0FBOEIsVUFBVUMsQ0FBVixFQUFhO0FBQ3ZDLGVBQU8sS0FBS2xCLEtBQVo7QUFDSCxLQUZEOztBQUtBOzs7Ozs7O0FBT0FWLGVBQVdRLFNBQVgsQ0FBcUJxQixNQUFyQixHQUE4QnpCLGFBQTlCO0FBQ0FPLFlBQVFILFNBQVIsQ0FBa0JxQixNQUFsQixHQUEyQnZCLElBQTNCOztBQUVBQyxZQUFRQyxTQUFSLENBQWtCcUIsTUFBbEIsR0FBMkIsVUFBVVAsQ0FBVixFQUFhO0FBQ3BDLGVBQU9BLEVBQUUsS0FBS1osS0FBUCxDQUFQO0FBQ0gsS0FGRDs7QUFLQTs7Ozs7QUFLQVYsZUFBV1EsU0FBWCxDQUFxQnNCLEtBQXJCLEdBQTZCLFlBQVk7QUFDckMsZUFBTyxLQUFLcEIsS0FBWjtBQUNILEtBRkQ7O0FBS0E7O0FBRUE7Ozs7OztBQU1BVixlQUFXUSxTQUFYLENBQXFCTSxJQUFyQixHQUE0QlYsYUFBNUI7O0FBRUFHLFlBQVFDLFNBQVIsQ0FBa0JNLElBQWxCLEdBQXlCLFVBQVVRLENBQVYsRUFBYU0sQ0FBYixFQUFnQjtBQUNyQyxlQUFPTixFQUFFLEtBQUtaLEtBQVAsQ0FBUDtBQUNILEtBRkQ7O0FBSUFDLFlBQVFILFNBQVIsQ0FBa0JNLElBQWxCLEdBQXlCLFVBQVVjLENBQVYsRUFBYUcsQ0FBYixFQUFnQjtBQUNyQyxlQUFPQSxFQUFFLEtBQUtyQixLQUFQLENBQVA7QUFDSCxLQUZEOztBQUlBOzs7Ozs7QUFNQVYsZUFBV1EsU0FBWCxDQUFxQndCLElBQXJCLEdBQTRCNUIsYUFBNUI7O0FBRUFHLFlBQVFDLFNBQVIsQ0FBa0J3QixJQUFsQixHQUF5QixVQUFVQyxPQUFWLEVBQW1CO0FBQ3hDLGVBQU9BLFFBQVExQixPQUFSLENBQWdCLEtBQUtHLEtBQXJCLENBQVA7QUFDSCxLQUZEOztBQUlBQyxZQUFRSCxTQUFSLENBQWtCd0IsSUFBbEIsR0FBeUIsVUFBVUMsT0FBVixFQUFtQjtBQUN4QyxlQUFPQSxRQUFRdEIsT0FBUixDQUFnQixLQUFLRCxLQUFyQixDQUFQO0FBQ0gsS0FGRDs7QUFLQTs7Ozs7O0FBTUFWLGVBQVdRLFNBQVgsQ0FBcUIwQixJQUFyQixHQUE0QjlCLGFBQTVCOztBQUVBRyxZQUFRQyxTQUFSLENBQWtCMEIsSUFBbEIsR0FBeUIsWUFBWTtBQUNqQyxlQUFPLEtBQUt2QixPQUFMLENBQWEsS0FBS0QsS0FBbEIsQ0FBUDtBQUNILEtBRkQ7O0FBSUFDLFlBQVFILFNBQVIsQ0FBa0IwQixJQUFsQixHQUF5QixZQUFZO0FBQ2pDLGVBQU8sS0FBSzNCLE9BQUwsQ0FBYSxLQUFLRyxLQUFsQixDQUFQO0FBQ0gsS0FGRDs7QUFLQTs7Ozs7O0FBTUFWLGVBQVdRLFNBQVgsQ0FBcUIyQixLQUFyQixHQUE2Qi9CLGFBQTdCOztBQUVBRyxZQUFRQyxTQUFSLENBQWtCMkIsS0FBbEIsR0FBMEIsVUFBVWIsQ0FBVixFQUFhTSxDQUFiLEVBQWdCO0FBQ3RDLGVBQU8sS0FBS3JCLE9BQUwsQ0FBYWUsRUFBRSxLQUFLWixLQUFQLENBQWIsQ0FBUDtBQUNILEtBRkQ7O0FBSUFDLFlBQVFILFNBQVIsQ0FBa0IyQixLQUFsQixHQUEwQixVQUFVUCxDQUFWLEVBQWFHLENBQWIsRUFBZ0I7QUFDdEMsZUFBTyxLQUFLcEIsT0FBTCxDQUFhb0IsRUFBRSxLQUFLckIsS0FBUCxDQUFiLENBQVA7QUFDSCxLQUZEOztBQUtBOzs7Ozs7QUFNQVYsZUFBV1EsU0FBWCxDQUFxQjRCLFVBQXJCLEdBQWtDaEMsYUFBbEM7QUFDQU8sWUFBUUgsU0FBUixDQUFrQjRCLFVBQWxCLEdBQStCOUIsSUFBL0I7O0FBRUFDLFlBQVFDLFNBQVIsQ0FBa0I0QixVQUFsQixHQUErQixVQUFVZCxDQUFWLEVBQWE7QUFDeEMsZUFBTyxLQUFLZixPQUFMLENBQWFlLEVBQUUsS0FBS1osS0FBUCxDQUFiLENBQVA7QUFDSCxLQUZEOztBQUlBOzs7Ozs7O0FBT0FWLGVBQVdRLFNBQVgsQ0FBcUI2QixPQUFyQixHQUErQnJDLFdBQVdRLFNBQVgsQ0FBcUI0QixVQUFwRDtBQUNBekIsWUFBUUgsU0FBUixDQUFrQjZCLE9BQWxCLEdBQTRCMUIsUUFBUUgsU0FBUixDQUFrQjRCLFVBQTlDO0FBQ0E3QixZQUFRQyxTQUFSLENBQWtCNkIsT0FBbEIsR0FBNEI5QixRQUFRQyxTQUFSLENBQWtCNEIsVUFBOUMiLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxMy0yMDE0IFF1aWxkcmVlbiBNb3R0YSA8cXVpbGRyZWVuQGdtYWlsLmNvbT5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxuLy8gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXNcbi8vICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbixcbi8vIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsXG4vLyBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLFxuLy8gYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcbi8vIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG4vLyBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuLy8gRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuLy8gTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxuLy8gTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxuLy8gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG4vLyBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLyoqXG4gKiBAbW9kdWxlIGxpYi92YWxpZGF0aW9uXG4gKi9cbi8vbW9kdWxlLmV4cG9ydHMgPSBWYWxpZGF0aW9uXG5cbi8vIC0tIEFsaWFzZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgY2xvbmUgPSBPYmplY3QuY3JlYXRlO1xuY29uc3QgdW5pbXBsZW1lbnRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKTtcbn07XG5jb25zdCBub29wID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuXG4vLyAtLSBJbXBsZW1lbnRhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUaGUgYFZhbGlkYXRpb25bzrEsIM6yXWAgaXMgYSBkaXNqdW5jdGlvbiB0aGF0J3MgbW9yZSBhcHByb3ByaWF0ZSBmb3JcbiAqIHZhbGlkYXRpbmcgaW5wdXRzLCBvciBhbnkgdXNlIGNhc2Ugd2hlcmUgeW91IHdhbnQgdG8gYWdncmVnYXRlIGZhaWx1cmVzLiBOb3RcbiAqIG9ubHkgZG9lcyB0aGUgYFZhbGlkYXRpb25gIHByb3ZpZGUgYSBiZXR0ZXIgdGVybWlub2xvZ3kgZm9yIHdvcmtpbmcgd2l0aFxuICogc3VjaCBjYXNlcyAoYEZhaWx1cmVgIGFuZCBgU3VjY2Vzc2AgdmVyc3VzIGBGYWlsdXJlYCBhbmQgYFN1Y2Nlc3NgKSwgaXQgYWxzb1xuICogYWxsb3dzIG9uZSB0byBlYXNpbHkgYWdncmVnYXRlIGZhaWx1cmVzIGFuZCBzdWNjZXNzZXMgYXMgYW4gQXBwbGljYXRpdmVcbiAqIEZ1bmN0b3IuXG4gKlxuICogQGNsYXNzXG4gKiBAc3VtbWFyeVxuICogVmFsaWRhdGlvblvOsSwgzrJdIDw6IEFwcGxpY2F0aXZlW86yXVxuICogICAgICAgICAgICAgICAgICAgLCBGdW5jdG9yW86yXVxuICogICAgICAgICAgICAgICAgICAgLCBTaG93XG4gKiAgICAgICAgICAgICAgICAgICAsIEVxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBWYWxpZGF0aW9uKCkge1xufVxuXG5GYWlsdXJlLnByb3RvdHlwZSA9IGNsb25lKFZhbGlkYXRpb24ucHJvdG90eXBlKTtcbmZ1bmN0aW9uIEZhaWx1cmUoYSkge1xuICAgIHRoaXMudmFsdWUgPSBhO1xufVxuXG5TdWNjZXNzLnByb3RvdHlwZSA9IGNsb25lKFZhbGlkYXRpb24ucHJvdG90eXBlKTtcbmZ1bmN0aW9uIFN1Y2Nlc3MoYSkge1xuICAgIHRoaXMudmFsdWUgPSBhO1xufVxuXG4vLyAtLSBDb25zdHJ1Y3RvcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgbmV3IGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZSBob2xkaW5nIGEgYEZhaWx1cmVgIHZhbHVlLlxuICpcbiAqIEBzdW1tYXJ5IGEg4oaSIFZhbGlkYXRpb25bzrEsIM6yXVxuICovXG5WYWxpZGF0aW9uLkZhaWx1cmUgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBuZXcgRmFpbHVyZShhKTtcbn07XG5WYWxpZGF0aW9uLnByb3RvdHlwZS5GYWlsdXJlID0gVmFsaWRhdGlvbi5GYWlsdXJlO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgYEV0aWhlclvOsSwgzrJdYCBzdHJ1Y3R1cmUgaG9sZGluZyBhIGBTdWNjZXNzYCB2YWx1ZS5cbiAqXG4gKiBAc3VtbWFyeSDOsiDihpIgVmFsaWRhdGlvblvOsSwgzrJdXG4gKi9cblZhbGlkYXRpb24uU3VjY2VzcyA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIG5ldyBTdWNjZXNzKGEpO1xufTtcblZhbGlkYXRpb24ucHJvdG90eXBlLlN1Y2Nlc3MgPSBWYWxpZGF0aW9uLlN1Y2Nlc3M7XG5cblxuLy8gLS0gQ29udmVyc2lvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIG5ldyBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUgZnJvbSBhIG51bGxhYmxlIHR5cGUuXG4gKlxuICogVGFrZXMgdGhlIGBGYWlsdXJlYCBjYXNlIGlmIHRoZSB2YWx1ZSBpcyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAuIFRha2VzIHRoZVxuICogYFN1Y2Nlc3NgIGNhc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBzdW1tYXJ5IM6xIOKGkiBWYWxpZGF0aW9uW86xLCDOsV1cbiAqL1xuVmFsaWRhdGlvbi5mcm9tTnVsbGFibGUgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAoYSAhPT0gbnVsbCkgPyBuZXcgU3VjY2VzcyhhKVxuICAgICAgICA6IC8qIG90aGVyd2lzZSAqLyAgbmV3IEZhaWx1cmUoYSk7XG59O1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuZnJvbU51bGxhYmxlID0gVmFsaWRhdGlvbi5mcm9tTnVsbGFibGU7XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIG5ldyBgRWl0aGVyW86xLCDOsl1gIHN0cnVjdHVyZSBmcm9tIGEgYFZhbGlkYXRpb25bzrEsIM6yXWAgdHlwZS5cbiAqXG4gKiBAc3VtbWFyeSBFaXRoZXJbzrEsIM6yXSDihpIgVmFsaWRhdGlvblvOsSwgzrJdXG4gKi9cblZhbGlkYXRpb24uZnJvbUVpdGhlciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGEuZm9sZChWYWxpZGF0aW9uLkZhaWx1cmUsIFZhbGlkYXRpb24uU3VjY2Vzcyk7XG59O1xuXG5cbi8vIC0tIFByZWRpY2F0ZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRydWUgaWYgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIGNvbnRhaW5zIGEgYEZhaWx1cmVgIHZhbHVlLlxuICpcbiAqIEBzdW1tYXJ5IEJvb2xlYW5cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuaXNGYWlsdXJlID0gZmFsc2U7XG5GYWlsdXJlLnByb3RvdHlwZS5pc0ZhaWx1cmUgPSB0cnVlO1xuXG4vKipcbiAqIFRydWUgaWYgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIGNvbnRhaW5zIGEgYFN1Y2Nlc3NgIHZhbHVlLlxuICpcbiAqIEBzdW1tYXJ5IEJvb2xlYW5cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuaXNTdWNjZXNzID0gZmFsc2U7XG5TdWNjZXNzLnByb3RvdHlwZS5pc1N1Y2Nlc3MgPSB0cnVlO1xuXG5cbi8vIC0tIEFwcGxpY2F0aXZlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYFZhbGlkYXRpb25bzrEsIM6yXWAgaW5zdGFuY2UgaG9sZGluZyB0aGUgYFN1Y2Nlc3NgIHZhbHVlIGBiYC5cbiAqXG4gKiBgYmAgY2FuIGJlIGFueSB2YWx1ZSwgaW5jbHVkaW5nIGBudWxsYCwgYHVuZGVmaW5lZGAgb3IgYW5vdGhlclxuICogYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlLlxuICpcbiAqIEBzdW1tYXJ5IM6yIOKGkiBWYWxpZGF0aW9uW86xLCDOsl1cbiAqL1xuVmFsaWRhdGlvbi5vZiA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIG5ldyBTdWNjZXNzKGEpO1xufTtcblZhbGlkYXRpb24ucHJvdG90eXBlLm9mID0gVmFsaWRhdGlvbi5vZjtcblxuXG4vKipcbiAqIEFwcGxpZXMgdGhlIGZ1bmN0aW9uIGluc2lkZSB0aGUgYFN1Y2Nlc3NgIGNhc2Ugb2YgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZVxuICogdG8gYW5vdGhlciBhcHBsaWNhdGl2ZSB0eXBlLlxuICpcbiAqIFRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBzaG91bGQgY29udGFpbiBhIGZ1bmN0aW9uIHZhbHVlLCBvdGhlcndpc2UgYSBgVHlwZUVycm9yYFxuICogaXMgdGhyb3duLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrIg4oaSIM6zXSwgZjpBcHBsaWNhdGl2ZVtfXSkgPT4gZlvOsl0g4oaSIGZbzrNdXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLmFwID0gdW5pbXBsZW1lbnRlZDtcblxuRmFpbHVyZS5wcm90b3R5cGUuYXAgPSBmdW5jdGlvbiAoYikge1xuICAgIHJldHVybiBiLmlzRmFpbHVyZSA/IHRoaXMuRmFpbHVyZSh0aGlzLnZhbHVlLmNvbmNhdChiLnZhbHVlKSlcbiAgICAgICAgOiAvKiBvdGhlcndpc2UgKi8gIHRoaXM7XG59O1xuXG5TdWNjZXNzLnByb3RvdHlwZS5hcCA9IGZ1bmN0aW9uIChiKSB7XG4gICAgcmV0dXJuIGIuaXNGYWlsdXJlID8gYlxuICAgICAgICA6IC8qIG90aGVyd2lzZSAqLyAgYi5tYXAodGhpcy52YWx1ZSk7XG59O1xuXG5cbi8vIC0tIEZ1bmN0b3IgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIGBTdWNjZXNzYCB2YWx1ZSBvZiB0aGUgYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlIHVzaW5nIGEgcmVndWxhclxuICogdW5hcnkgZnVuY3Rpb24uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsiDihpIgzrMpIOKGkiBWYWxpZGF0aW9uW86xLCDOs11cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUubWFwID0gdW5pbXBsZW1lbnRlZDtcbkZhaWx1cmUucHJvdG90eXBlLm1hcCA9IG5vb3A7XG5cblN1Y2Nlc3MucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChmKSB7XG4gICAgcmV0dXJuIHRoaXMub2YoZih0aGlzLnZhbHVlKSk7XG59O1xuXG5cbi8vIC0tIFNob3cgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJldHVybnMgYSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUuXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IFZvaWQg4oaSIFN0cmluZ1xuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IHVuaW1wbGVtZW50ZWQ7XG5cbkZhaWx1cmUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnVmFsaWRhdGlvbi5GYWlsdXJlKCcgKyB0aGlzLnZhbHVlICsgJyknO1xufTtcblxuU3VjY2Vzcy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdWYWxpZGF0aW9uLlN1Y2Nlc3MoJyArIHRoaXMudmFsdWUgKyAnKSc7XG59O1xuXG5cbi8vIC0tIEVxIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRlc3RzIGlmIGFuIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZSBpcyBlcXVhbCB0byBhbm90aGVyIGBWYWxpZGF0aW9uW86xLCDOsl1gXG4gKiBzdHJ1Y3R1cmUuXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IFZhbGlkYXRpb25bzrEsIM6yXSDihpIgQm9vbGVhblxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5pc0VxdWFsID0gdW5pbXBsZW1lbnRlZDtcblxuRmFpbHVyZS5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGEuaXNGYWlsdXJlICYmIChhLnZhbHVlID09PSB0aGlzLnZhbHVlKTtcbn07XG5cblN1Y2Nlc3MucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBhLmlzU3VjY2VzcyAmJiAoYS52YWx1ZSA9PT0gdGhpcy52YWx1ZSk7XG59O1xuXG5cbi8vIC0tIEV4dHJhY3RpbmcgYW5kIHJlY292ZXJpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBgU3VjY2Vzc2AgdmFsdWUgb3V0IG9mIHRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUsIGlmIGl0XG4gKiBleGlzdHMuIE90aGVyd2lzZSB0aHJvd3MgYSBgVHlwZUVycm9yYC5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gVm9pZCDihpIgzrIgICAgICAgICA6OiBwYXJ0aWFsLCB0aHJvd3NcbiAqIEBzZWUge0BsaW5rIG1vZHVsZTpsaWIvdmFsaWRhdGlvbn5WYWxpZGF0aW9uI2dldE9yRWxzZX0g4oCUIEEgZ2V0dGVyIHRoYXQgY2FuIGhhbmRsZSBmYWlsdXJlcy5cbiAqIEBzZWUge0BsaW5rIG1vZHVsZTpsaWIvdmFsaWRhdGlvbn5WYWxpZGF0aW9uI21lcmdlfSDigJQgVGhlIGNvbnZlcmdlbmNlIG9mIGJvdGggdmFsdWVzLlxuICogQHRocm93cyB7VHlwZUVycm9yfSBpZiB0aGUgc3RydWN0dXJlIGhhcyBubyBgU3VjY2Vzc2AgdmFsdWUuXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLmdldCA9IHVuaW1wbGVtZW50ZWQ7XG5cbkZhaWx1cmUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5cXCd0IGV4dHJhY3QgdGhlIHZhbHVlIG9mIGEgRmFpbHVyZShhKS4nKTtcbn07XG5cblN1Y2Nlc3MucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgYFN1Y2Nlc3NgIHZhbHVlIG91dCBvZiB0aGUgYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlLiBJZiB0aGVcbiAqIHN0cnVjdHVyZSBkb2Vzbid0IGhhdmUgYSBgU3VjY2Vzc2AgdmFsdWUsIHJldHVybnMgdGhlIGdpdmVuIGRlZmF1bHQuXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IM6yIOKGkiDOslxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5nZXRPckVsc2UgPSB1bmltcGxlbWVudGVkO1xuXG5GYWlsdXJlLnByb3RvdHlwZS5nZXRPckVsc2UgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBhO1xufTtcblxuU3VjY2Vzcy5wcm90b3R5cGUuZ2V0T3JFbHNlID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgYEZhaWx1cmVgIHZhbHVlIGludG8gYSBuZXcgYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlLiBEb2VzIG5vdGhpbmdcbiAqIGlmIHRoZSBzdHJ1Y3R1cmUgY29udGFpbiBhIGBTdWNjZXNzYCB2YWx1ZS5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gKM6xIOKGkiBWYWxpZGF0aW9uW86zLCDOsl0pIOKGkiBWYWxpZGF0aW9uW86zLCDOsl1cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUub3JFbHNlID0gdW5pbXBsZW1lbnRlZDtcblN1Y2Nlc3MucHJvdG90eXBlLm9yRWxzZSA9IG5vb3A7XG5cbkZhaWx1cmUucHJvdG90eXBlLm9yRWxzZSA9IGZ1bmN0aW9uIChmKSB7XG4gICAgcmV0dXJuIGYodGhpcy52YWx1ZSk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2Ygd2hpY2hldmVyIHNpZGUgb2YgdGhlIGRpc2p1bmN0aW9uIHRoYXQgaXMgcHJlc2VudC5cbiAqXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6xXSkgPT4gVm9pZCDihpIgzrFcbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuXG5cbi8vIC0tIEZvbGRzIGFuZCBFeHRlbmRlZCBUcmFuc2Zvcm1hdGlvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEFwcGxpZXMgYSBmdW5jdGlvbiB0byBlYWNoIGNhc2UgaW4gdGhpcyBkYXRhIHN0cnVjdHVyZS5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gKM6xIOKGkiDOsyksICjOsiDihpIgzrMpIOKGkiDOs1xuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5mb2xkID0gdW5pbXBsZW1lbnRlZDtcblxuRmFpbHVyZS5wcm90b3R5cGUuZm9sZCA9IGZ1bmN0aW9uIChmLCBfKSB7XG4gICAgcmV0dXJuIGYodGhpcy52YWx1ZSk7XG59O1xuXG5TdWNjZXNzLnByb3RvdHlwZS5mb2xkID0gZnVuY3Rpb24gKF8sIGcpIHtcbiAgICByZXR1cm4gZyh0aGlzLnZhbHVlKTtcbn07XG5cbi8qKlxuICogQ2F0YW1vcnBoaXNtLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiB7IFN1Y2Nlc3M6IM6xIOKGkiDOsywgRmFpbHVyZTogzrEg4oaSIM6zIH0g4oaSIM6zXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLmNhdGEgPSB1bmltcGxlbWVudGVkO1xuXG5GYWlsdXJlLnByb3RvdHlwZS5jYXRhID0gZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgICByZXR1cm4gcGF0dGVybi5GYWlsdXJlKHRoaXMudmFsdWUpO1xufTtcblxuU3VjY2Vzcy5wcm90b3R5cGUuY2F0YSA9IGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gICAgcmV0dXJuIHBhdHRlcm4uU3VjY2Vzcyh0aGlzLnZhbHVlKTtcbn07XG5cblxuLyoqXG4gKiBTd2FwcyB0aGUgZGlzanVuY3Rpb24gdmFsdWVzLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiBWb2lkIOKGkiBWYWxpZGF0aW9uW86yLCDOsV1cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuc3dhcCA9IHVuaW1wbGVtZW50ZWQ7XG5cbkZhaWx1cmUucHJvdG90eXBlLnN3YXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuU3VjY2Vzcyh0aGlzLnZhbHVlKTtcbn07XG5cblN1Y2Nlc3MucHJvdG90eXBlLnN3YXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuRmFpbHVyZSh0aGlzLnZhbHVlKTtcbn07XG5cblxuLyoqXG4gKiBNYXBzIGJvdGggc2lkZXMgb2YgdGhlIGRpc2p1bmN0aW9uLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiAozrEg4oaSIM6zKSwgKM6yIOKGkiDOtCkg4oaSIFZhbGlkYXRpb25bzrMsIM60XVxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5iaW1hcCA9IHVuaW1wbGVtZW50ZWQ7XG5cbkZhaWx1cmUucHJvdG90eXBlLmJpbWFwID0gZnVuY3Rpb24gKGYsIF8pIHtcbiAgICByZXR1cm4gdGhpcy5GYWlsdXJlKGYodGhpcy52YWx1ZSkpO1xufTtcblxuU3VjY2Vzcy5wcm90b3R5cGUuYmltYXAgPSBmdW5jdGlvbiAoXywgZykge1xuICAgIHJldHVybiB0aGlzLlN1Y2Nlc3MoZyh0aGlzLnZhbHVlKSk7XG59O1xuXG5cbi8qKlxuICogTWFwcyB0aGUgZmFpbHVyZSBzaWRlIG9mIHRoZSBkaXNqdW5jdGlvbi5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gKM6xIOKGkiDOsykg4oaSIFZhbGlkYXRpb25bzrMsIM6yXVxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5mYWlsdXJlTWFwID0gdW5pbXBsZW1lbnRlZDtcblN1Y2Nlc3MucHJvdG90eXBlLmZhaWx1cmVNYXAgPSBub29wO1xuXG5GYWlsdXJlLnByb3RvdHlwZS5mYWlsdXJlTWFwID0gZnVuY3Rpb24gKGYpIHtcbiAgICByZXR1cm4gdGhpcy5GYWlsdXJlKGYodGhpcy52YWx1ZSkpO1xufTtcblxuLyoqXG4gKiBNYXBzIHRoZSBmYWlsdXJlIHNpZGUgb2YgdGhlIGRpc2p1bmN0aW9uLlxuICpcbiAqIEBtZXRob2RcbiAqIEBkZXByZWNhdGVkIGluIGZhdm91ciBvZiB7QGxpbmsgbW9kdWxlOmxpYi92YWxpZGF0aW9uflZhbGlkYXRpb24jZmFpbHVyZU1hcH1cbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiAozrEg4oaSIM6zKSDihpIgVmFsaWRhdGlvblvOsywgzrJdXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLmxlZnRNYXAgPSBWYWxpZGF0aW9uLnByb3RvdHlwZS5mYWlsdXJlTWFwO1xuU3VjY2Vzcy5wcm90b3R5cGUubGVmdE1hcCA9IFN1Y2Nlc3MucHJvdG90eXBlLmZhaWx1cmVNYXA7XG5GYWlsdXJlLnByb3RvdHlwZS5sZWZ0TWFwID0gRmFpbHVyZS5wcm90b3R5cGUuZmFpbHVyZU1hcDtcbiJdfQ==