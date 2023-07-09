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
    return 'Validation.Failure(' + this.value.toString() + ')';
  };

  Success.prototype.toString = function () {
    return 'Validation.Success(' + this.value.toString() + ')';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL3ZhbGlkYXRpb24uanMiXSwibmFtZXMiOlsiVmFsaWRhdGlvbiIsImNsb25lIiwiT2JqZWN0IiwiY3JlYXRlIiwidW5pbXBsZW1lbnRlZCIsIkVycm9yIiwibm9vcCIsIkZhaWx1cmUiLCJwcm90b3R5cGUiLCJhIiwidmFsdWUiLCJTdWNjZXNzIiwiZnJvbU51bGxhYmxlIiwiZnJvbUVpdGhlciIsImZvbGQiLCJpc0ZhaWx1cmUiLCJpc1N1Y2Nlc3MiLCJvZiIsImFwIiwiYiIsImNvbmNhdCIsIm1hcCIsImYiLCJ0b1N0cmluZyIsImlzRXF1YWwiLCJnZXQiLCJUeXBlRXJyb3IiLCJnZXRPckVsc2UiLCJfIiwib3JFbHNlIiwibWVyZ2UiLCJnIiwiY2F0YSIsInBhdHRlcm4iLCJzd2FwIiwiYmltYXAiLCJmYWlsdXJlTWFwIiwibGVmdE1hcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O1VBcURnQkEsVSxHQUFBQSxVO0FBckRoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTs7QUFFQTtBQUNBLE1BQU1DLFFBQVFDLE9BQU9DLE1BQXJCO0FBQ0EsV0FBU0MsYUFBVCxHQUF5QjtBQUN2QixVQUFNLElBQUlDLEtBQUosQ0FBVSxrQkFBVixDQUFOO0FBQ0Q7QUFDRCxXQUFTQyxJQUFULEdBQWdCO0FBQ2QsV0FBTyxJQUFQO0FBQ0Q7O0FBR0Q7O0FBRUE7Ozs7Ozs7Ozs7Ozs7OztBQWVPLFdBQVNOLFVBQVQsR0FBc0IsQ0FDNUI7O0FBRURPLFVBQVFDLFNBQVIsR0FBb0JQLE1BQU1ELFdBQVdRLFNBQWpCLENBQXBCO0FBQ0EsV0FBU0QsT0FBVCxDQUFpQkUsQ0FBakIsRUFBb0I7QUFDbEIsU0FBS0MsS0FBTCxHQUFhRCxDQUFiO0FBQ0Q7O0FBRURFLFVBQVFILFNBQVIsR0FBb0JQLE1BQU1ELFdBQVdRLFNBQWpC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QyxTQUFSLENBQWtCNkIsT0FBbEIsR0FBNEI5QixRQUFRQyxTQUFSLENBQWtCNEIsVUFBOUMiLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxMy0yMDE0IFF1aWxkcmVlbiBNb3R0YSA8cXVpbGRyZWVuQGdtYWlsLmNvbT5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxuLy8gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXNcbi8vICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbixcbi8vIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsXG4vLyBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLFxuLy8gYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcbi8vIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG4vLyBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuLy8gRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuLy8gTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxuLy8gTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxuLy8gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG4vLyBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLyoqXG4gKiBAbW9kdWxlIGxpYi92YWxpZGF0aW9uXG4gKi9cbi8vIG1vZHVsZS5leHBvcnRzID0gVmFsaWRhdGlvblxuXG4vLyAtLSBBbGlhc2VzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGNsb25lID0gT2JqZWN0LmNyZWF0ZTtcbmZ1bmN0aW9uIHVuaW1wbGVtZW50ZWQoKSB7XG4gIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xufVxuZnVuY3Rpb24gbm9vcCgpIHtcbiAgcmV0dXJuIHRoaXM7XG59XG5cblxuLy8gLS0gSW1wbGVtZW50YXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogVGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIGlzIGEgZGlzanVuY3Rpb24gdGhhdCdzIG1vcmUgYXBwcm9wcmlhdGUgZm9yXG4gKiB2YWxpZGF0aW5nIGlucHV0cywgb3IgYW55IHVzZSBjYXNlIHdoZXJlIHlvdSB3YW50IHRvIGFnZ3JlZ2F0ZSBmYWlsdXJlcy4gTm90XG4gKiBvbmx5IGRvZXMgdGhlIGBWYWxpZGF0aW9uYCBwcm92aWRlIGEgYmV0dGVyIHRlcm1pbm9sb2d5IGZvciB3b3JraW5nIHdpdGhcbiAqIHN1Y2ggY2FzZXMgKGBGYWlsdXJlYCBhbmQgYFN1Y2Nlc3NgIHZlcnN1cyBgRmFpbHVyZWAgYW5kIGBTdWNjZXNzYCksIGl0IGFsc29cbiAqIGFsbG93cyBvbmUgdG8gZWFzaWx5IGFnZ3JlZ2F0ZSBmYWlsdXJlcyBhbmQgc3VjY2Vzc2VzIGFzIGFuIEFwcGxpY2F0aXZlXG4gKiBGdW5jdG9yLlxuICpcbiAqIEBjbGFzc1xuICogQHN1bW1hcnlcbiAqIFZhbGlkYXRpb25bzrEsIM6yXSA8OiBBcHBsaWNhdGl2ZVvOsl1cbiAqICAgICAgICAgICAgICAgICAgICwgRnVuY3RvclvOsl1cbiAqICAgICAgICAgICAgICAgICAgICwgU2hvd1xuICogICAgICAgICAgICAgICAgICAgLCBFcVxuICovXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGlvbigpIHtcbn1cblxuRmFpbHVyZS5wcm90b3R5cGUgPSBjbG9uZShWYWxpZGF0aW9uLnByb3RvdHlwZSk7XG5mdW5jdGlvbiBGYWlsdXJlKGEpIHtcbiAgdGhpcy52YWx1ZSA9IGE7XG59XG5cblN1Y2Nlc3MucHJvdG90eXBlID0gY2xvbmUoVmFsaWRhdGlvbi5wcm90b3R5cGUpO1xuZnVuY3Rpb24gU3VjY2VzcyhhKSB7XG4gIHRoaXMudmFsdWUgPSBhO1xufVxuXG4vLyAtLSBDb25zdHJ1Y3RvcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgbmV3IGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZSBob2xkaW5nIGEgYEZhaWx1cmVgIHZhbHVlLlxuICpcbiAqIEBzdW1tYXJ5IGEg4oaSIFZhbGlkYXRpb25bzrEsIM6yXVxuICovXG5WYWxpZGF0aW9uLkZhaWx1cmUgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBuZXcgRmFpbHVyZShhKTtcbn07XG5WYWxpZGF0aW9uLnByb3RvdHlwZS5GYWlsdXJlID0gVmFsaWRhdGlvbi5GYWlsdXJlO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgYEV0aWhlclvOsSwgzrJdYCBzdHJ1Y3R1cmUgaG9sZGluZyBhIGBTdWNjZXNzYCB2YWx1ZS5cbiAqXG4gKiBAc3VtbWFyeSDOsiDihpIgVmFsaWRhdGlvblvOsSwgzrJdXG4gKi9cblZhbGlkYXRpb24uU3VjY2VzcyA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIG5ldyBTdWNjZXNzKGEpO1xufTtcblZhbGlkYXRpb24ucHJvdG90eXBlLlN1Y2Nlc3MgPSBWYWxpZGF0aW9uLlN1Y2Nlc3M7XG5cblxuLy8gLS0gQ29udmVyc2lvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIG5ldyBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUgZnJvbSBhIG51bGxhYmxlIHR5cGUuXG4gKlxuICogVGFrZXMgdGhlIGBGYWlsdXJlYCBjYXNlIGlmIHRoZSB2YWx1ZSBpcyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAuIFRha2VzIHRoZVxuICogYFN1Y2Nlc3NgIGNhc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBzdW1tYXJ5IM6xIOKGkiBWYWxpZGF0aW9uW86xLCDOsV1cbiAqL1xuVmFsaWRhdGlvbi5mcm9tTnVsbGFibGUgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiAoYSAhPT0gbnVsbCkgPyBuZXcgU3VjY2VzcyhhKVxuICAgIDogLyogb3RoZXJ3aXNlICovIG5ldyBGYWlsdXJlKGEpO1xufTtcblZhbGlkYXRpb24ucHJvdG90eXBlLmZyb21OdWxsYWJsZSA9IFZhbGlkYXRpb24uZnJvbU51bGxhYmxlO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgYEVpdGhlclvOsSwgzrJdYCBzdHJ1Y3R1cmUgZnJvbSBhIGBWYWxpZGF0aW9uW86xLCDOsl1gIHR5cGUuXG4gKlxuICogQHN1bW1hcnkgRWl0aGVyW86xLCDOsl0g4oaSIFZhbGlkYXRpb25bzrEsIM6yXVxuICovXG5WYWxpZGF0aW9uLmZyb21FaXRoZXIgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBhLmZvbGQoVmFsaWRhdGlvbi5GYWlsdXJlLCBWYWxpZGF0aW9uLlN1Y2Nlc3MpO1xufTtcblxuXG4vLyAtLSBQcmVkaWNhdGVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUcnVlIGlmIHRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBjb250YWlucyBhIGBGYWlsdXJlYCB2YWx1ZS5cbiAqXG4gKiBAc3VtbWFyeSBCb29sZWFuXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLmlzRmFpbHVyZSA9IGZhbHNlO1xuRmFpbHVyZS5wcm90b3R5cGUuaXNGYWlsdXJlID0gdHJ1ZTtcblxuLyoqXG4gKiBUcnVlIGlmIHRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBjb250YWlucyBhIGBTdWNjZXNzYCB2YWx1ZS5cbiAqXG4gKiBAc3VtbWFyeSBCb29sZWFuXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLmlzU3VjY2VzcyA9IGZhbHNlO1xuU3VjY2Vzcy5wcm90b3R5cGUuaXNTdWNjZXNzID0gdHJ1ZTtcblxuXG4vLyAtLSBBcHBsaWNhdGl2ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBWYWxpZGF0aW9uW86xLCDOsl1gIGluc3RhbmNlIGhvbGRpbmcgdGhlIGBTdWNjZXNzYCB2YWx1ZSBgYmAuXG4gKlxuICogYGJgIGNhbiBiZSBhbnkgdmFsdWUsIGluY2x1ZGluZyBgbnVsbGAsIGB1bmRlZmluZWRgIG9yIGFub3RoZXJcbiAqIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZS5cbiAqXG4gKiBAc3VtbWFyeSDOsiDihpIgVmFsaWRhdGlvblvOsSwgzrJdXG4gKi9cblZhbGlkYXRpb24ub2YgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBuZXcgU3VjY2VzcyhhKTtcbn07XG5WYWxpZGF0aW9uLnByb3RvdHlwZS5vZiA9IFZhbGlkYXRpb24ub2Y7XG5cblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBmdW5jdGlvbiBpbnNpZGUgdGhlIGBTdWNjZXNzYCBjYXNlIG9mIHRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmVcbiAqIHRvIGFub3RoZXIgYXBwbGljYXRpdmUgdHlwZS5cbiAqXG4gKiBUaGUgYFZhbGlkYXRpb25bzrEsIM6yXWAgc2hvdWxkIGNvbnRhaW4gYSBmdW5jdGlvbiB2YWx1ZSwgb3RoZXJ3aXNlIGEgYFR5cGVFcnJvcmBcbiAqIGlzIHRocm93bi5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yIOKGkiDOs10sIGY6QXBwbGljYXRpdmVbX10pID0+IGZbzrJdIOKGkiBmW86zXVxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5hcCA9IHVuaW1wbGVtZW50ZWQ7XG5cbkZhaWx1cmUucHJvdG90eXBlLmFwID0gZnVuY3Rpb24oYikge1xuICByZXR1cm4gYi5pc0ZhaWx1cmUgPyB0aGlzLkZhaWx1cmUodGhpcy52YWx1ZS5jb25jYXQoYi52YWx1ZSkpXG4gICAgOiAvKiBvdGhlcndpc2UgKi8gdGhpcztcbn07XG5cblN1Y2Nlc3MucHJvdG90eXBlLmFwID0gZnVuY3Rpb24oYikge1xuICByZXR1cm4gYi5pc0ZhaWx1cmUgPyBiXG4gICAgOiAvKiBvdGhlcndpc2UgKi8gYi5tYXAodGhpcy52YWx1ZSk7XG59O1xuXG5cbi8vIC0tIEZ1bmN0b3IgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIGBTdWNjZXNzYCB2YWx1ZSBvZiB0aGUgYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlIHVzaW5nIGEgcmVndWxhclxuICogdW5hcnkgZnVuY3Rpb24uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsiDihpIgzrMpIOKGkiBWYWxpZGF0aW9uW86xLCDOs11cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUubWFwID0gdW5pbXBsZW1lbnRlZDtcbkZhaWx1cmUucHJvdG90eXBlLm1hcCA9IG5vb3A7XG5cblN1Y2Nlc3MucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uKGYpIHtcbiAgcmV0dXJuIHRoaXMub2YoZih0aGlzLnZhbHVlKSk7XG59O1xuXG5cbi8vIC0tIFNob3cgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJldHVybnMgYSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUuXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IFZvaWQg4oaSIFN0cmluZ1xuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IHVuaW1wbGVtZW50ZWQ7XG5cbkZhaWx1cmUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnVmFsaWRhdGlvbi5GYWlsdXJlKCcgKyB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgKyAnKSc7XG59O1xuXG5TdWNjZXNzLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJ1ZhbGlkYXRpb24uU3VjY2VzcygnICsgdGhpcy52YWx1ZS50b1N0cmluZygpICsgJyknO1xufTtcblxuXG4vLyAtLSBFcSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUZXN0cyBpZiBhbiBgVmFsaWRhdGlvblvOsSwgzrJdYCBzdHJ1Y3R1cmUgaXMgZXF1YWwgdG8gYW5vdGhlciBgVmFsaWRhdGlvblvOsSwgzrJdYFxuICogc3RydWN0dXJlLlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiBWYWxpZGF0aW9uW86xLCDOsl0g4oaSIEJvb2xlYW5cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuaXNFcXVhbCA9IHVuaW1wbGVtZW50ZWQ7XG5cbkZhaWx1cmUucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBhLmlzRmFpbHVyZSAmJiAoYS52YWx1ZSA9PT0gdGhpcy52YWx1ZSk7XG59O1xuXG5TdWNjZXNzLnByb3RvdHlwZS5pc0VxdWFsID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gYS5pc1N1Y2Nlc3MgJiYgKGEudmFsdWUgPT09IHRoaXMudmFsdWUpO1xufTtcblxuXG4vLyAtLSBFeHRyYWN0aW5nIGFuZCByZWNvdmVyaW5nIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgYFN1Y2Nlc3NgIHZhbHVlIG91dCBvZiB0aGUgYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlLCBpZiBpdFxuICogZXhpc3RzLiBPdGhlcndpc2UgdGhyb3dzIGEgYFR5cGVFcnJvcmAuXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IFZvaWQg4oaSIM6yICAgICAgICAgOjogcGFydGlhbCwgdGhyb3dzXG4gKiBAc2VlIHtAbGluayBtb2R1bGU6bGliL3ZhbGlkYXRpb25+VmFsaWRhdGlvbiNnZXRPckVsc2V9IOKAlCBBIGdldHRlciB0aGF0IGNhbiBoYW5kbGUgZmFpbHVyZXMuXG4gKiBAc2VlIHtAbGluayBtb2R1bGU6bGliL3ZhbGlkYXRpb25+VmFsaWRhdGlvbiNtZXJnZX0g4oCUIFRoZSBjb252ZXJnZW5jZSBvZiBib3RoIHZhbHVlcy5cbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gaWYgdGhlIHN0cnVjdHVyZSBoYXMgbm8gYFN1Y2Nlc3NgIHZhbHVlLlxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5nZXQgPSB1bmltcGxlbWVudGVkO1xuXG5GYWlsdXJlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbigpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2FuXFwndCBleHRyYWN0IHRoZSB2YWx1ZSBvZiBhIEZhaWx1cmUoYSkuJyk7XG59O1xuXG5TdWNjZXNzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuXG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIGBTdWNjZXNzYCB2YWx1ZSBvdXQgb2YgdGhlIGBWYWxpZGF0aW9uW86xLCDOsl1gIHN0cnVjdHVyZS4gSWYgdGhlXG4gKiBzdHJ1Y3R1cmUgZG9lc24ndCBoYXZlIGEgYFN1Y2Nlc3NgIHZhbHVlLCByZXR1cm5zIHRoZSBnaXZlbiBkZWZhdWx0LlxuICpcbiAqIEBtZXRob2RcbiAqIEBzdW1tYXJ5IChAVmFsaWRhdGlvblvOsSwgzrJdKSA9PiDOsiDihpIgzrJcbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuZ2V0T3JFbHNlID0gdW5pbXBsZW1lbnRlZDtcblxuRmFpbHVyZS5wcm90b3R5cGUuZ2V0T3JFbHNlID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gYTtcbn07XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuU3VjY2Vzcy5wcm90b3R5cGUuZ2V0T3JFbHNlID0gZnVuY3Rpb24oXykge1xuICByZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgYEZhaWx1cmVgIHZhbHVlIGludG8gYSBuZXcgYFZhbGlkYXRpb25bzrEsIM6yXWAgc3RydWN0dXJlLiBEb2VzIG5vdGhpbmdcbiAqIGlmIHRoZSBzdHJ1Y3R1cmUgY29udGFpbiBhIGBTdWNjZXNzYCB2YWx1ZS5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gKM6xIOKGkiBWYWxpZGF0aW9uW86zLCDOsl0pIOKGkiBWYWxpZGF0aW9uW86zLCDOsl1cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUub3JFbHNlID0gdW5pbXBsZW1lbnRlZDtcblN1Y2Nlc3MucHJvdG90eXBlLm9yRWxzZSA9IG5vb3A7XG5cbkZhaWx1cmUucHJvdG90eXBlLm9yRWxzZSA9IGZ1bmN0aW9uKGYpIHtcbiAgcmV0dXJuIGYodGhpcy52YWx1ZSk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmFsdWUgb2Ygd2hpY2hldmVyIHNpZGUgb2YgdGhlIGRpc2p1bmN0aW9uIHRoYXQgaXMgcHJlc2VudC5cbiAqXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6xXSkgPT4gVm9pZCDihpIgzrFcbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuXG5cbi8vIC0tIEZvbGRzIGFuZCBFeHRlbmRlZCBUcmFuc2Zvcm1hdGlvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEFwcGxpZXMgYSBmdW5jdGlvbiB0byBlYWNoIGNhc2UgaW4gdGhpcyBkYXRhIHN0cnVjdHVyZS5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gKM6xIOKGkiDOsyksICjOsiDihpIgzrMpIOKGkiDOs1xuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5mb2xkID0gdW5pbXBsZW1lbnRlZDtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5GYWlsdXJlLnByb3RvdHlwZS5mb2xkID0gZnVuY3Rpb24oZiwgXykge1xuICByZXR1cm4gZih0aGlzLnZhbHVlKTtcbn07XG5cblN1Y2Nlc3MucHJvdG90eXBlLmZvbGQgPSBmdW5jdGlvbihfLCBnKSB7XG4gIHJldHVybiBnKHRoaXMudmFsdWUpO1xufTtcblxuLyoqXG4gKiBDYXRhbW9ycGhpc20uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IHsgU3VjY2VzczogzrEg4oaSIM6zLCBGYWlsdXJlOiDOsSDihpIgzrMgfSDihpIgzrNcbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuY2F0YSA9IHVuaW1wbGVtZW50ZWQ7XG5cbkZhaWx1cmUucHJvdG90eXBlLmNhdGEgPSBmdW5jdGlvbihwYXR0ZXJuKSB7XG4gIHJldHVybiBwYXR0ZXJuLkZhaWx1cmUodGhpcy52YWx1ZSk7XG59O1xuXG5TdWNjZXNzLnByb3RvdHlwZS5jYXRhID0gZnVuY3Rpb24ocGF0dGVybikge1xuICByZXR1cm4gcGF0dGVybi5TdWNjZXNzKHRoaXMudmFsdWUpO1xufTtcblxuXG4vKipcbiAqIFN3YXBzIHRoZSBkaXNqdW5jdGlvbiB2YWx1ZXMuXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+IFZvaWQg4oaSIFZhbGlkYXRpb25bzrIsIM6xXVxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5zd2FwID0gdW5pbXBsZW1lbnRlZDtcblxuRmFpbHVyZS5wcm90b3R5cGUuc3dhcCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5TdWNjZXNzKHRoaXMudmFsdWUpO1xufTtcblxuU3VjY2Vzcy5wcm90b3R5cGUuc3dhcCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5GYWlsdXJlKHRoaXMudmFsdWUpO1xufTtcblxuXG4vKipcbiAqIE1hcHMgYm90aCBzaWRlcyBvZiB0aGUgZGlzanVuY3Rpb24uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsSDihpIgzrMpLCAozrIg4oaSIM60KSDihpIgVmFsaWRhdGlvblvOsywgzrRdXG4gKi9cblZhbGlkYXRpb24ucHJvdG90eXBlLmJpbWFwID0gdW5pbXBsZW1lbnRlZDtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5GYWlsdXJlLnByb3RvdHlwZS5iaW1hcCA9IGZ1bmN0aW9uKGYsIF8pIHtcbiAgcmV0dXJuIHRoaXMuRmFpbHVyZShmKHRoaXMudmFsdWUpKTtcbn07XG5cblN1Y2Nlc3MucHJvdG90eXBlLmJpbWFwID0gZnVuY3Rpb24oXywgZykge1xuICByZXR1cm4gdGhpcy5TdWNjZXNzKGcodGhpcy52YWx1ZSkpO1xufTtcblxuXG4vKipcbiAqIE1hcHMgdGhlIGZhaWx1cmUgc2lkZSBvZiB0aGUgZGlzanVuY3Rpb24uXG4gKlxuICogQG1ldGhvZFxuICogQHN1bW1hcnkgKEBWYWxpZGF0aW9uW86xLCDOsl0pID0+ICjOsSDihpIgzrMpIOKGkiBWYWxpZGF0aW9uW86zLCDOsl1cbiAqL1xuVmFsaWRhdGlvbi5wcm90b3R5cGUuZmFpbHVyZU1hcCA9IHVuaW1wbGVtZW50ZWQ7XG5TdWNjZXNzLnByb3RvdHlwZS5mYWlsdXJlTWFwID0gbm9vcDtcblxuRmFpbHVyZS5wcm90b3R5cGUuZmFpbHVyZU1hcCA9IGZ1bmN0aW9uKGYpIHtcbiAgcmV0dXJuIHRoaXMuRmFpbHVyZShmKHRoaXMudmFsdWUpKTtcbn07XG5cbi8qKlxuICogTWFwcyB0aGUgZmFpbHVyZSBzaWRlIG9mIHRoZSBkaXNqdW5jdGlvbi5cbiAqXG4gKiBAbWV0aG9kXG4gKiBAZGVwcmVjYXRlZCBpbiBmYXZvdXIgb2Yge0BsaW5rIG1vZHVsZTpsaWIvdmFsaWRhdGlvbn5WYWxpZGF0aW9uI2ZhaWx1cmVNYXB9XG4gKiBAc3VtbWFyeSAoQFZhbGlkYXRpb25bzrEsIM6yXSkgPT4gKM6xIOKGkiDOsykg4oaSIFZhbGlkYXRpb25bzrMsIM6yXVxuICovXG5WYWxpZGF0aW9uLnByb3RvdHlwZS5sZWZ0TWFwID0gVmFsaWRhdGlvbi5wcm90b3R5cGUuZmFpbHVyZU1hcDtcblN1Y2Nlc3MucHJvdG90eXBlLmxlZnRNYXAgPSBTdWNjZXNzLnByb3RvdHlwZS5mYWlsdXJlTWFwO1xuRmFpbHVyZS5wcm90b3R5cGUubGVmdE1hcCA9IEZhaWx1cmUucHJvdG90eXBlLmZhaWx1cmVNYXA7XG4iXX0=