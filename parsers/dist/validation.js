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
  // module.exports = Validation

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

  // eslint-disable-next-line no-unused-vars
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

  // eslint-disable-next-line no-unused-vars
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

  // eslint-disable-next-line no-unused-vars
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3ZhbGlkYXRpb24uanMiXSwibmFtZXMiOlsiVmFsaWRhdGlvbiIsImNsb25lIiwiT2JqZWN0IiwiY3JlYXRlIiwidW5pbXBsZW1lbnRlZCIsIkVycm9yIiwibm9vcCIsIkZhaWx1cmUiLCJwcm90b3R5cGUiLCJhIiwidmFsdWUiLCJTdWNjZXNzIiwiZnJvbU51bGxhYmxlIiwiZnJvbUVpdGhlciIsImZvbGQiLCJpc0ZhaWx1cmUiLCJpc1N1Y2Nlc3MiLCJvZiIsImFwIiwiYiIsImNvbmNhdCIsIm1hcCIsImYiLCJ0b1N0cmluZyIsImlzRXF1YWwiLCJnZXQiLCJUeXBlRXJyb3IiLCJnZXRPckVsc2UiLCJfIiwib3JFbHNlIiwibWVyZ2UiLCJnIiwiY2F0YSIsInBhdHRlcm4iLCJzd2FwIiwiYmltYXAiLCJmYWlsdXJlTWFwIiwibGVmdE1hcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1VBcURnQkEsVSxHQUFBQSxVO0FBckRoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTs7QUFFQTtBQUNBLE1BQU1DLFFBQVFDLE9BQU9DLE1BQXJCO0FBQ0EsV0FBU0MsYUFBVCxHQUF5QjtBQUN2QixVQUFNLElBQUlDLEtBQUosQ0FBVSxrQkFBVixDQUFOO0FBQ0Q7QUFDRCxXQUFTQyxJQUFULEdBQWdCO0FBQ2QsV0FBTyxJQUFQO0FBQ0Q7O0FBR0Q7O0FBRUE7Ozs7Ozs7Ozs7Ozs7OztBQWVPLFdBQVNOLFVBQVQsR0FBc0IsQ0FDNUI7O0FBRURPLFVBQVFDLFNBQVIsR0FBb0JQLE1BQU1ELFdBQVdRLFNBQWpCLENBQXBCO0FBQ0EsV0FBU0QsT0FBVCxDQUFpQkUsQ0FBakIsRUFBb0I7QUFDbEIsU0FBS0MsS0FBTCxHQUFhRCxDQUFiO0FBQ0Q7O0FBRURFLFVBQVFILFNBQVIsR0FBb0JQLE1BQU1ELFdBQVdRLFNBQWpC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QyxTQUFSLENBQWtCNEIsVUFBOUMiLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxMy0yMDE0IFF1aWxkcmVlbiBNb3R0YSA8cXVpbGRyZWVuQGdtYWlsLmNvbT5cclxuLy9cclxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb25cclxuLy8gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXNcclxuLy8gKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLFxyXG4vLyBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLFxyXG4vLyBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLFxyXG4vLyBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLFxyXG4vLyBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuLy9cclxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcclxuLy8gaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbi8vXHJcbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXHJcbi8vIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxyXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxyXG4vLyBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXHJcbi8vIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cclxuLy8gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXHJcbi8vIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxyXG5cclxuLyoqXHJcbiAqIEBtb2R1bGUgbGliL3ZhbGlkYXRpb25cclxuICovXHJcbi8vIG1vZHVsZS5leHBvcnRzID0gVmFsaWRhdGlvblxyXG5cclxuLy8gLS0gQWxpYXNlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbmNvbnN0IGNsb25lID0gT2JqZWN0LmNyZWF0ZTtcclxuZnVuY3Rpb24gdW5pbXBsZW1lbnRlZCgpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKTtcclxufVxyXG5mdW5jdGlvbiBub29wKCkge1xyXG4gIHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5cclxuLy8gLS0gSW1wbGVtZW50YXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICogVGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIGlzIGEgZGlzanVuY3Rpb24gdGhhdCdzIG1vcmUgYXBwcm9wcmlhdGUgZm9yXHJcbiAqIHZhbGlkYXRpbmcgaW5wdXRzLCBvciBhbnkgdXNlIGNhc2Ugd2hlcmUgeW91IHdhbnQgdG8gYWdncmVnYXRlIGZhaWx1cmVzLiBOb3RcclxuICogb25seSBkb2VzIHRoZSBgVmFsaWRhdGlvbmAgcHJvdmlkZSBhIGJldHRlciB0ZXJtaW5vbG9neSBmb3Igd29ya2luZyB3aXRoXHJcbiAqIHN1Y2ggY2FzZXMgKGBGYWlsdXJlYCBhbmQgYFN1Y2Nlc3NgIHZlcnN1cyBgRmFpbHVyZWAgYW5kIGBTdWNjZXNzYCksIGl0IGFsc29cclxuICogYWxsb3dzIG9uZSB0byBlYXNpbHkgYWdncmVnYXRlIGZhaWx1cmVzIGFuZCBzdWNjZXNzZXMgYXMgYW4gQXBwbGljYXRpdmVcclxuICogRnVuY3Rvci5cclxuICpcclxuICogQGNsYXNzXHJcbiAqIEBzdW1tYXJ5XHJcbiAqIFZhbGlkYXRpb25bzrEsIM6yXSA8OiBBcHBsaWNhdGl2ZVvOsl1cclxuICogICAgICAgICAgICAgICAgICAgLCBGdW5jdG9yW86yXVxyXG4gKiAgICAgICAgICAgICAgICAgICAsIFNob3dcclxuICogICAgICAgICAgICAgICAgICAgLCBFcVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFZhbGlkYXRpb24oKSB7XHJcbn1cclxuXHJcbkZhaWx1cmUucHJvdG90eXBlID0gY2xvbmUoVmFsaWRhdGlvbi5wcm90b3R5cGUpO1xyXG5mdW5jdGlvbiBGYWlsdXJlKGEpIHtcclxuICB0aGlzLnZhbHVlID0gYTtcclxufVxyXG5cclxuU3VjY2Vzcy5wcm90b3R5cGUgPSBjbG9uZShWYWxpZGF0aW9uLnByb3RvdHlwZSk7XHJcbmZ1bmN0aW9uIFN1Y2Nlc3MoYSkge1xyXG4gIHRoaXMudmFsdWUgPSBhO1xyXG59XHJcblxyXG4vLyAtLSBDb25zdHJ1Y3RvcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RzIGEgbmV3IGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZSBob2xkaW5nIGEgYEZhaWx1cmVgIHZhbHVlLlxyXG4gKlxyXG4gKiBAc3VtbWFyeSBhIOKGkiBWYWxpZGF0aW9uW86xLCDOsl1cclxuICovXHJcblZhbGlkYXRpb24uRmFpbHVyZSA9IGZ1bmN0aW9uKGEpIHtcclxuICByZXR1cm4gbmV3IEZhaWx1cmUoYSk7XHJcbn07XHJcblZhbGlkYXRpb24ucHJvdG90eXBlLkZhaWx1cmUgPSBWYWxpZGF0aW9uLkZhaWx1cmU7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0cyBhIG5ldyBgRXRpaGVyW86xLCDOsl1gIHN0cnVjdHVyZSBob2xkaW5nIGEgYFN1Y2Nlc3NgIHZhbHVlLlxyXG4gKlxyXG4gKiBAc3VtbWFyeSDOsiDihpIgVmFsaWRhdGlvblvOsSwgzrJdXHJcbiAqL1xyXG5WYWxpZGF0aW9uLlN1Y2Nlc3MgPSBmdW5jdGlvbihhKSB7XHJcbiAgcmV0dXJuIG5ldyBTdWNjZXNzKGEpO1xyXG59O1xyXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5TdWNjZXNzID0gVmFsaWRhdGlvbi5TdWNjZXNzO1xyXG5cclxuXHJcbi8vIC0tIENvbnZlcnNpb25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdHMgYSBuZXcgYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlIGZyb20gYSBudWxsYWJsZSB0eXBlLlxyXG4gKlxyXG4gKiBUYWtlcyB0aGUgYEZhaWx1cmVgIGNhc2UgaWYgdGhlIHZhbHVlIGlzIGBudWxsYCBvciBgdW5kZWZpbmVkYC4gVGFrZXMgdGhlXHJcbiAqIGBTdWNjZXNzYCBjYXNlIG90aGVyd2lzZS5cclxuICpcclxuICogQHN1bW1hcnkgzrEg4oaSIFZhbGlkYXRpb25bzrEsIM6xXVxyXG4gKi9cclxuVmFsaWRhdGlvbi5mcm9tTnVsbGFibGUgPSBmdW5jdGlvbihhKSB7XHJcbiAgcmV0dXJuIChhICE9PSBudWxsKSA/IG5ldyBTdWNjZXNzKGEpXHJcbiAgICA6IC8qIG90aGVyd2lzZSAqLyBuZXcgRmFpbHVyZShhKTtcclxufTtcclxuVmFsaWRhdGlvbi5wcm90b3R5cGUuZnJvbU51bGxhYmxlID0gVmFsaWRhdGlvbi5mcm9tTnVsbGFibGU7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0cyBhIG5ldyBgRWl0aGVyW86xLCDOsl1gIHN0cnVjdHVyZSBmcm9tIGEgYFZhbGlkYXRpb25bzrEsIM6yXWAgdHlwZS5cclxuICpcclxuICogQHN1bW1hcnkgRWl0aGVyW86xLCDOsl0g4oaSIFZhbGlkYXRpb25bzrEsIM6yXVxyXG4gKi9cclxuVmFsaWRhdGlvbi5mcm9tRWl0aGVyID0gZnVuY3Rpb24oYSkge1xyXG4gIHJldHVybiBhLmZvbGQoVmFsaWRhdGlvbi5GYWlsdXJlLCBWYWxpZGF0aW9uLlN1Y2Nlc3MpO1xyXG59O1xyXG5cclxuXHJcbi8vIC0tIFByZWRpY2F0ZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLyoqXHJcbiAqIFRydWUgaWYgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIGNvbnRhaW5zIGEgYEZhaWx1cmVgIHZhbHVlLlxyXG4gKlxyXG4gKiBAc3VtbWFyeSBCb29sZWFuXHJcbiAqL1xyXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5pc0ZhaWx1cmUgPSBmYWxzZTtcclxuRmFpbHVyZS5wcm90b3R5cGUuaXNGYWlsdXJlID0gdHJ1ZTtcclxuXHJcbi8qKlxyXG4gKiBUcnVlIGlmIHRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBjb250YWlucyBhIGBTdWNjZXNzYCB2YWx1ZS5cclxuICpcclxuICogQHN1bW1hcnkgQm9vbGVhblxyXG4gKi9cclxuVmFsaWRhdGlvbi5wcm90b3R5cGUuaXNTdWNjZXNzID0gZmFsc2U7XHJcblN1Y2Nlc3MucHJvdG90eXBlLmlzU3VjY2VzcyA9IHRydWU7XHJcblxyXG5cclxuLy8gLS0gQXBwbGljYXRpdmUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBgVmFsaWRhdGlvblvOsSwgzrJdYCBpbnN0YW5jZSBob2xkaW5nIHRoZSBgU3VjY2Vzc2AgdmFsdWUgYGJgLlxyXG4gKlxyXG4gKiBgYmAgY2FuIGJlIGFueSB2YWx1ZSwgaW5jbHVkaW5nIGBudWxsYCwgYHVuZGVmaW5lZGAgb3IgYW5vdGhlclxyXG4gKiBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUuXHJcbiAqXHJcbiAqIEBzdW1tYXJ5IM6yIOKGkiBWYWxpZGF0aW9uW86xLCDOsl1cclxuICovXHJcblZhbGlkYXRpb24ub2YgPSBmdW5jdGlvbihhKSB7XHJcbiAgcmV0dXJuIG5ldyBTdWNjZXNzKGEpO1xyXG59O1xyXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5vZiA9IFZhbGlkYXRpb24ub2Y7XHJcblxyXG5cclxuLyoqXHJcbiAqIEFwcGxpZXMgdGhlIGZ1bmN0aW9uIGluc2lkZSB0aGUgYFN1Y2Nlc3NgIGNhc2Ugb2YgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZVxyXG4gKiB0byBhbm90aGVyIGFwcGxpY2F0aXZlIHR5cGUuXHJcbiAqXHJcbiAqIFRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBzaG91bGQgY29udGFpbiBhIGZ1bmN0aW9uIHZhbHVlLCBvdGhlcndpc2UgYSBgVHlwZUVycm9yYFxyXG4gKiBpcyB0aHJvd24uXHJcbiAqXHJcbiAqIEBtZXRob2RcclxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsiDihpIgzrNdLCBmOkFwcGxpY2F0aXZlW19dKSA9PiBmW86yXSDihpIgZlvOs11cclxuICovXHJcblZhbGlkYXRpb24ucHJvdG90eXBlLmFwID0gdW5pbXBsZW1lbnRlZDtcclxuXHJcbkZhaWx1cmUucHJvdG90eXBlLmFwID0gZnVuY3Rpb24oYikge1xyXG4gIHJldHVybiBiLmlzRmFpbHVyZSA/IHRoaXMuRmFpbHVyZSh0aGlzLnZhbHVlLmNvbmNhdChiLnZhbHVlKSlcclxuICAgIDogLyogb3RoZXJ3aXNlICovIHRoaXM7XHJcbn07XHJcblxyXG5TdWNjZXNzLnByb3RvdHlwZS5hcCA9IGZ1bmN0aW9uKGIpIHtcclxuICByZXR1cm4gYi5pc0ZhaWx1cmUgPyBiXHJcbiAgICA6IC8qIG90aGVyd2lzZSAqLyBiLm1hcCh0aGlzLnZhbHVlKTtcclxufTtcclxuXHJcblxyXG4vLyAtLSBGdW5jdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSBgU3VjY2Vzc2AgdmFsdWUgb2YgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZSB1c2luZyBhIHJlZ3VsYXJcclxuICogdW5hcnkgZnVuY3Rpb24uXHJcbiAqXHJcbiAqIEBtZXRob2RcclxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsiDihpIgzrMpIOKGkiBWYWxpZGF0aW9uW86xLCDOs11cclxuICovXHJcblZhbGlkYXRpb24ucHJvdG90eXBlLm1hcCA9IHVuaW1wbGVtZW50ZWQ7XHJcbkZhaWx1cmUucHJvdG90eXBlLm1hcCA9IG5vb3A7XHJcblxyXG5TdWNjZXNzLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbihmKSB7XHJcbiAgcmV0dXJuIHRoaXMub2YoZih0aGlzLnZhbHVlKSk7XHJcbn07XHJcblxyXG5cclxuLy8gLS0gU2hvdyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIHRleHR1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZS5cclxuICpcclxuICogQG1ldGhvZFxyXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gVm9pZCDihpIgU3RyaW5nXHJcbiAqL1xyXG5WYWxpZGF0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IHVuaW1wbGVtZW50ZWQ7XHJcblxyXG5GYWlsdXJlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiAnVmFsaWRhdGlvbi5GYWlsdXJlKCcgKyB0aGlzLnZhbHVlICsgJyknO1xyXG59O1xyXG5cclxuU3VjY2Vzcy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gJ1ZhbGlkYXRpb24uU3VjY2VzcygnICsgdGhpcy52YWx1ZSArICcpJztcclxufTtcclxuXHJcblxyXG4vLyAtLSBFcSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBUZXN0cyBpZiBhbiBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUgaXMgZXF1YWwgdG8gYW5vdGhlciBgVmFsaWRhdGlvblvOsSwgzrJdYFxyXG4gKiBzdHJ1Y3R1cmUuXHJcbiAqXHJcbiAqIEBtZXRob2RcclxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IFZhbGlkYXRpb25bzrEsIM6yXSDihpIgQm9vbGVhblxyXG4gKi9cclxuVmFsaWRhdGlvbi5wcm90b3R5cGUuaXNFcXVhbCA9IHVuaW1wbGVtZW50ZWQ7XHJcblxyXG5GYWlsdXJlLnByb3RvdHlwZS5pc0VxdWFsID0gZnVuY3Rpb24oYSkge1xyXG4gIHJldHVybiBhLmlzRmFpbHVyZSAmJiAoYS52YWx1ZSA9PT0gdGhpcy52YWx1ZSk7XHJcbn07XHJcblxyXG5TdWNjZXNzLnByb3RvdHlwZS5pc0VxdWFsID0gZnVuY3Rpb24oYSkge1xyXG4gIHJldHVybiBhLmlzU3VjY2VzcyAmJiAoYS52YWx1ZSA9PT0gdGhpcy52YWx1ZSk7XHJcbn07XHJcblxyXG5cclxuLy8gLS0gRXh0cmFjdGluZyBhbmQgcmVjb3ZlcmluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICogRXh0cmFjdHMgdGhlIGBTdWNjZXNzYCB2YWx1ZSBvdXQgb2YgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZSwgaWYgaXRcclxuICogZXhpc3RzLiBPdGhlcndpc2UgdGhyb3dzIGEgYFR5cGVFcnJvcmAuXHJcbiAqXHJcbiAqIEBtZXRob2RcclxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IFZvaWQg4oaSIM6yICAgICAgICAgOjogcGFydGlhbCwgdGhyb3dzXHJcbiAqIEBzZWUge0BsaW5rIG1vZHVsZTpsaWIvdmFsaWRhdGlvbn5WYWxpZGF0aW9uI2dldE9yRWxzZX0g4oCUIEEgZ2V0dGVyIHRoYXQgY2FuIGhhbmRsZSBmYWlsdXJlcy5cclxuICogQHNlZSB7QGxpbmsgbW9kdWxlOmxpYi92YWxpZGF0aW9uflZhbGlkYXRpb24jbWVyZ2V9IOKAlCBUaGUgY29udmVyZ2VuY2Ugb2YgYm90aCB2YWx1ZXMuXHJcbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gaWYgdGhlIHN0cnVjdHVyZSBoYXMgbm8gYFN1Y2Nlc3NgIHZhbHVlLlxyXG4gKi9cclxuVmFsaWRhdGlvbi5wcm90b3R5cGUuZ2V0ID0gdW5pbXBsZW1lbnRlZDtcclxuXHJcbkZhaWx1cmUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCkge1xyXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NhblxcJ3QgZXh0cmFjdCB0aGUgdmFsdWUgb2YgYSBGYWlsdXJlKGEpLicpO1xyXG59O1xyXG5cclxuU3VjY2Vzcy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEV4dHJhY3RzIHRoZSBgU3VjY2Vzc2AgdmFsdWUgb3V0IG9mIHRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUuIElmIHRoZVxyXG4gKiBzdHJ1Y3R1cmUgZG9lc24ndCBoYXZlIGEgYFN1Y2Nlc3NgIHZhbHVlLCByZXR1cm5zIHRoZSBnaXZlbiBkZWZhdWx0LlxyXG4gKlxyXG4gKiBAbWV0aG9kXHJcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiDOsiDihpIgzrJcclxuICovXHJcblZhbGlkYXRpb24ucHJvdG90eXBlLmdldE9yRWxzZSA9IHVuaW1wbGVtZW50ZWQ7XHJcblxyXG5GYWlsdXJlLnByb3RvdHlwZS5nZXRPckVsc2UgPSBmdW5jdGlvbihhKSB7XHJcbiAgcmV0dXJuIGE7XHJcbn07XHJcblxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcclxuU3VjY2Vzcy5wcm90b3R5cGUuZ2V0T3JFbHNlID0gZnVuY3Rpb24oXykge1xyXG4gIHJldHVybiB0aGlzLnZhbHVlO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIGEgYEZhaWx1cmVgIHZhbHVlIGludG8gYSBuZXcgYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlLiBEb2VzIG5vdGhpbmdcclxuICogaWYgdGhlIHN0cnVjdHVyZSBjb250YWluIGEgYFN1Y2Nlc3NgIHZhbHVlLlxyXG4gKlxyXG4gKiBAbWV0aG9kXHJcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiAozrEg4oaSIFZhbGlkYXRpb25bzrMsIM6yXSkg4oaSIFZhbGlkYXRpb25bzrMsIM6yXVxyXG4gKi9cclxuVmFsaWRhdGlvbi5wcm90b3R5cGUub3JFbHNlID0gdW5pbXBsZW1lbnRlZDtcclxuU3VjY2Vzcy5wcm90b3R5cGUub3JFbHNlID0gbm9vcDtcclxuXHJcbkZhaWx1cmUucHJvdG90eXBlLm9yRWxzZSA9IGZ1bmN0aW9uKGYpIHtcclxuICByZXR1cm4gZih0aGlzLnZhbHVlKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgdmFsdWUgb2Ygd2hpY2hldmVyIHNpZGUgb2YgdGhlIGRpc2p1bmN0aW9uIHRoYXQgaXMgcHJlc2VudC5cclxuICpcclxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsV0pID0+IFZvaWQg4oaSIM6xXHJcbiAqL1xyXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5tZXJnZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLnZhbHVlO1xyXG59O1xyXG5cclxuXHJcbi8vIC0tIEZvbGRzIGFuZCBFeHRlbmRlZCBUcmFuc2Zvcm1hdGlvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLyoqXHJcbiAqIEFwcGxpZXMgYSBmdW5jdGlvbiB0byBlYWNoIGNhc2UgaW4gdGhpcyBkYXRhIHN0cnVjdHVyZS5cclxuICpcclxuICogQG1ldGhvZFxyXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gKM6xIOKGkiDOsyksICjOsiDihpIgzrMpIOKGkiDOs1xyXG4gKi9cclxuVmFsaWRhdGlvbi5wcm90b3R5cGUuZm9sZCA9IHVuaW1wbGVtZW50ZWQ7XHJcblxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcclxuRmFpbHVyZS5wcm90b3R5cGUuZm9sZCA9IGZ1bmN0aW9uKGYsIF8pIHtcclxuICByZXR1cm4gZih0aGlzLnZhbHVlKTtcclxufTtcclxuXHJcblN1Y2Nlc3MucHJvdG90eXBlLmZvbGQgPSBmdW5jdGlvbihfLCBnKSB7XHJcbiAgcmV0dXJuIGcodGhpcy52YWx1ZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2F0YW1vcnBoaXNtLlxyXG4gKlxyXG4gKiBAbWV0aG9kXHJcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiB7IFN1Y2Nlc3M6IM6xIOKGkiDOsywgRmFpbHVyZTogzrEg4oaSIM6zIH0g4oaSIM6zXHJcbiAqL1xyXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5jYXRhID0gdW5pbXBsZW1lbnRlZDtcclxuXHJcbkZhaWx1cmUucHJvdG90eXBlLmNhdGEgPSBmdW5jdGlvbihwYXR0ZXJuKSB7XHJcbiAgcmV0dXJuIHBhdHRlcm4uRmFpbHVyZSh0aGlzLnZhbHVlKTtcclxufTtcclxuXHJcblN1Y2Nlc3MucHJvdG90eXBlLmNhdGEgPSBmdW5jdGlvbihwYXR0ZXJuKSB7XHJcbiAgcmV0dXJuIHBhdHRlcm4uU3VjY2Vzcyh0aGlzLnZhbHVlKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogU3dhcHMgdGhlIGRpc2p1bmN0aW9uIHZhbHVlcy5cclxuICpcclxuICogQG1ldGhvZFxyXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gVm9pZCDihpIgVmFsaWRhdGlvblvOsiwgzrFdXHJcbiAqL1xyXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5zd2FwID0gdW5pbXBsZW1lbnRlZDtcclxuXHJcbkZhaWx1cmUucHJvdG90eXBlLnN3YXAgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5TdWNjZXNzKHRoaXMudmFsdWUpO1xyXG59O1xyXG5cclxuU3VjY2Vzcy5wcm90b3R5cGUuc3dhcCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLkZhaWx1cmUodGhpcy52YWx1ZSk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIE1hcHMgYm90aCBzaWRlcyBvZiB0aGUgZGlzanVuY3Rpb24uXHJcbiAqXHJcbiAqIEBtZXRob2RcclxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsSDihpIgzrMpLCAozrIg4oaSIM60KSDihpIgVmFsaWRhdGlvblvOsywgzrRdXHJcbiAqL1xyXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5iaW1hcCA9IHVuaW1wbGVtZW50ZWQ7XHJcblxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcclxuRmFpbHVyZS5wcm90b3R5cGUuYmltYXAgPSBmdW5jdGlvbihmLCBfKSB7XHJcbiAgcmV0dXJuIHRoaXMuRmFpbHVyZShmKHRoaXMudmFsdWUpKTtcclxufTtcclxuXHJcblN1Y2Nlc3MucHJvdG90eXBlLmJpbWFwID0gZnVuY3Rpb24oXywgZykge1xyXG4gIHJldHVybiB0aGlzLlN1Y2Nlc3MoZyh0aGlzLnZhbHVlKSk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIE1hcHMgdGhlIGZhaWx1cmUgc2lkZSBvZiB0aGUgZGlzanVuY3Rpb24uXHJcbiAqXHJcbiAqIEBtZXRob2RcclxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsSDihpIgzrMpIOKGkiBWYWxpZGF0aW9uW86zLCDOsl1cclxuICovXHJcblZhbGlkYXRpb24ucHJvdG90eXBlLmZhaWx1cmVNYXAgPSB1bmltcGxlbWVudGVkO1xyXG5TdWNjZXNzLnByb3RvdHlwZS5mYWlsdXJlTWFwID0gbm9vcDtcclxuXHJcbkZhaWx1cmUucHJvdG90eXBlLmZhaWx1cmVNYXAgPSBmdW5jdGlvbihmKSB7XHJcbiAgcmV0dXJuIHRoaXMuRmFpbHVyZShmKHRoaXMudmFsdWUpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNYXBzIHRoZSBmYWlsdXJlIHNpZGUgb2YgdGhlIGRpc2p1bmN0aW9uLlxyXG4gKlxyXG4gKiBAbWV0aG9kXHJcbiAqIEBkZXByZWNhdGVkIGluIGZhdm91ciBvZiB7QGxpbmsgbW9kdWxlOmxpYi92YWxpZGF0aW9uflZhbGlkYXRpb24jZmFpbHVyZU1hcH1cclxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsSDihpIgzrMpIOKGkiBWYWxpZGF0aW9uW86zLCDOsl1cclxuICovXHJcblZhbGlkYXRpb24ucHJvdG90eXBlLmxlZnRNYXAgPSBWYWxpZGF0aW9uLnByb3RvdHlwZS5mYWlsdXJlTWFwO1xyXG5TdWNjZXNzLnByb3RvdHlwZS5sZWZ0TWFwID0gU3VjY2Vzcy5wcm90b3R5cGUuZmFpbHVyZU1hcDtcclxuRmFpbHVyZS5wcm90b3R5cGUubGVmdE1hcCA9IEZhaWx1cmUucHJvdG90eXBlLmZhaWx1cmVNYXA7XHJcbiJdfQ==