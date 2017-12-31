define(['chai', 'util', 'classes'], function (_chai, _util, _classes) {
    'use strict';

    var _slicedToArray = function () {
        function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;

            try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                    _arr.push(_s.value);

                    if (i && _arr.length === i) break;
                }
            } catch (err) {
                _d = true;
                _e = err;
            } finally {
                try {
                    if (!_n && _i["return"]) _i["return"]();
                } finally {
                    if (_d) throw _e;
                }
            }

            return _arr;
        }

        return function (arr, i) {
            if (Array.isArray(arr)) {
                return arr;
            } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
        };
    }();

    describe('among helper classes', function () {

        describe('JValue\'s are parsed JSON values', function () {
            describe('with JString\'s as parsed JSON string values', function () {
                var jstring = _classes.JValue.JString('abc');
                it('that are retrievable', function () {
                    (0, _chai.expect)(jstring.value).to.be.eql('abc');
                    (0, _chai.expect)(jstring.toString()).to.be.eql('JString(abc)');
                });
                it('that are immutable', function () {
                    (0, _chai.expect)(function () {
                        jstring.value = 'def';
                    }).to.throw;
                });
                it('that gotta be strings', function () {
                    (0, _chai.expect)(function () {
                        return _classes.JValue.JString(123);
                    }).to.throw;
                });
                it('that gotta by types with a supertype', function () {
                    var jstring = _classes.JValue.JString('123');
                    (0, _chai.expect)(jstring.isJValue).to.be.true;
                    (0, _chai.expect)(jstring.isJString).to.be.true;
                });
            });
            it('with JNumber\'s as parsed JSON float values', function () {
                var jnumber = _classes.JValue.JNumber(123.45e-23);
                (0, _chai.expect)(jnumber.value).to.be.eql(123.45e-23);
                (0, _chai.expect)(jnumber.toString()).to.be.eql('JNumber(1.2345e-21)');
                (0, _chai.expect)(jnumber.isJValue).to.be.true;
                (0, _chai.expect)(jnumber.isJNumber).to.be.true;
                (0, _chai.expect)(function () {
                    jnumber.value = 123;
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JNumber('x');
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JNumber(NaN);
                }).to.throw;
            });
            it('with JBool\'s as parsed JSON boolean values', function () {
                var jbool = _classes.JValue.JBool(true);
                (0, _chai.expect)(jbool.value).to.be.true;
                (0, _chai.expect)(jbool.toString()).to.be.eql('JBool(true)');
                (0, _chai.expect)(jbool.isJValue).to.be.true;
                (0, _chai.expect)(jbool.isJBool).to.be.true;
                (0, _chai.expect)(function () {
                    jbool.value = false;
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JBool('x');
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JBool(123);
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JBool(NaN);
                }).to.throw;
            });
            it('with JNull\'s as parsed JSON null values', function () {
                var jnull = _classes.JValue.JNull(null);
                (0, _chai.expect)(jnull.value).to.be.null;
                (0, _chai.expect)(jnull.toString()).to.be.eql('JNull(null)');
                (0, _chai.expect)(jnull.isJValue).to.be.true;
                (0, _chai.expect)(jnull.isJNull).to.be.true;
                (0, _chai.expect)(function () {
                    jnull.value = 123;
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JNull('');
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JNull(undefined);
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JNull(NaN);
                }).to.throw;
            });
            it('with JArray\'s as parsed JSON arrays', function () {
                var jarray = _classes.JValue.JArray(_classes.JValue.JString('a'), _classes.JValue.JBool(false), _classes.JValue.JNull(null));
                var jarValue = jarray.value;
                (0, _chai.expect)(jarValue[0].value).to.be.eql('a');
                (0, _chai.expect)(jarValue[1].value).to.be.eql(false);
                (0, _chai.expect)(jarValue[2].value).to.be.eql(null);
                (0, _chai.expect)(jarray.toString()).to.be.eql('JArray([JString(a),JBool(false),JNull(null),])');
                (0, _chai.expect)(jarray.isJValue).to.be.true;
                (0, _chai.expect)(jarray.isJArray).to.be.true;
                (0, _chai.expect)(function () {
                    jarray.value = 123;
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JArray('');
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JNull(undefined);
                }).to.throw;
                (0, _chai.expect)(function () {
                    return _classes.JValue.JNull(NaN);
                }).to.throw;
            });
        });

        describe('Position\'s', function () {
            var rows = [[1, 2, 3], ['a', 'b', 'c', 'd'], ['A', 'B', 'C']];
            it('include tables of chars and allow to retrieve char options', function () {
                var pos00 = (0, _classes.Position)(rows, 0, 0);
                (0, _chai.expect)(pos00.isPosition).to.be.true;
                (0, _chai.expect)(pos00.char().isJust).to.be.true;
                (0, _chai.expect)(pos00.char().value).to.be.eql(1);
                var pos11 = (0, _classes.Position)(rows, 1, 1);
                (0, _chai.expect)(pos11.char().isJust).to.be.true;
                (0, _chai.expect)(pos11.char().value).to.be.eql('b');
            });
            it('allow to increment the position and retrieve further chars', function () {
                var pos01 = (0, _classes.Position)(rows, 0, 0).incrPos();
                (0, _chai.expect)(pos01.char().value).to.be.eql(2);
                var pos20 = (0, _classes.Position)(rows, 1, 3).incrPos();
                (0, _chai.expect)(pos20.char().value).to.be.eql('A');
            });
            it('return Nothing when position is beyond the contained rows content', function () {
                var pos1010 = (0, _classes.Position)(rows, 10, 10);
                (0, _chai.expect)(pos1010.char().isNothing).to.be.true;
                var pos23 = (0, _classes.Position)(rows, 2, 2).incrPos();
                (0, _chai.expect)(pos23.char().isNothing).to.be.true;
            });
            it('can be initialized from text strings', function () {
                var pos00 = _classes.Position.fromText('Lorem ipsum dolor sit amet');
                (0, _chai.expect)(pos00.char().value).to.be.eql('L');
                (0, _chai.expect)(pos00.incrPos().incrPos().incrPos().incrPos().char().value).to.be.eql('m');
            });
            it('can be initialized also from multiline text strings, stripping newlines away', function () {
                var pos00 = _classes.Position.fromText('Lorem \nipsum');
                (0, _chai.expect)(pos00.char().value).to.be.eql('L');
                (0, _chai.expect)(pos00.incrPos().incrPos().incrPos().incrPos().incrPos().incrPos().char().value).to.be.eql('i');
            });
            it('return strings containing all characters starting from a given position, for the sake of testing', function () {
                var pos01 = _classes.Position.fromText('Lorem').incrPos();
                (0, _chai.expect)(pos01.rest()).to.be.eql('orem');
            });
        });

        describe('somes', function () {
            it('include a value and allow to retrieve it', function () {
                var aSome = (0, _classes.some)(12);
                (0, _chai.expect)(aSome.val()).to.be.eql(12);
                (0, _chai.expect)((0, _util.isSome)(aSome)).to.be.true;
                (0, _chai.expect)(aSome.toString()).to.be.eql('some(12)');
            });
        });

        describe('nones', function () {
            it('are just a signpost', function () {
                var aNone = (0, _classes.none)();
                (0, _chai.expect)(aNone.val()).to.be.null;
                (0, _chai.expect)((0, _util.isNone)(aNone)).to.be.true;
                (0, _chai.expect)(aNone.toString()).to.be.eql('none()');
            });
        });

        describe('pairs', function () {
            it('include 2 values and allow to retrieve them', function () {
                var apair = (0, _classes.pair)(true, 12);
                (0, _chai.expect)(apair[0]).to.be.eql(true);
                (0, _chai.expect)(apair[1]).to.be.eql(12);
                (0, _chai.expect)(apair.type).to.be.eql('pair');
                (0, _chai.expect)((0, _util.isPair)(apair)).to.be.true;
            });
            it('are actually arrays, and therefore allow positional destructuring', function () {
                var _pair = (0, _classes.pair)(true, 12),
                    _pair2 = _slicedToArray(_pair, 2),
                    a = _pair2[0],
                    b = _pair2[1];

                (0, _chai.expect)(a).to.be.eql(true);
                (0, _chai.expect)(b).to.be.eql(12);
            });
        });

        describe('Pair\'s', function () {
            it('include 2 values and allow to retrieve them', function () {
                var apair = _classes.Tuple.Pair(true, 12);
                (0, _chai.expect)(apair[0]).to.be.eql(true);
                (0, _chai.expect)(apair[1]).to.be.eql(12);
                (0, _chai.expect)(apair.type).to.be.eql('pair');
                (0, _chai.expect)(apair.isPair).to.be.true;
                (0, _chai.expect)(apair.toString()).to.be.eql('[true,12]');
            });
            it('are immutable, and throw if you try to change them', function () {
                var apair = _classes.Tuple.Pair(true, 12);
                (0, _chai.expect)(function () {
                    atriple[0] = false;
                }).to.throw;
                (0, _chai.expect)(function () {
                    atriple[1] = 13;
                }).to.throw;
            });
            it('are true iterables, and therefore allow positional destructuring', function () {
                var _Tuple$Pair = _classes.Tuple.Pair(true, 12),
                    _Tuple$Pair2 = _slicedToArray(_Tuple$Pair, 2),
                    a = _Tuple$Pair2[0],
                    b = _Tuple$Pair2[1];

                (0, _chai.expect)(a).to.be.eql(true);
                (0, _chai.expect)(b).to.be.eql(12);
            });
        });

        describe('Triple\'s', function () {
            it('include 3 values and allow to retrieve them', function () {
                var atriple = _classes.Tuple.Triple(true, 12, 'a');
                (0, _chai.expect)(atriple[0]).to.be.eql(true);
                (0, _chai.expect)(atriple[1]).to.be.eql(12);
                (0, _chai.expect)(atriple[2]).to.be.eql('a');
                (0, _chai.expect)(atriple.type).to.be.eql('triple');
                (0, _chai.expect)(atriple.isTriple).to.be.true;
                (0, _chai.expect)(atriple.toString()).to.be.eql('[true,12,a]');
            });
            it('are immutable, and throw if you try to change them', function () {
                var atriple = _classes.Tuple.Triple(true, 12, 'a');
                (0, _chai.expect)(function () {
                    atriple[0] = false;
                }).to.throw;
                (0, _chai.expect)(function () {
                    atriple[1] = 13;
                }).to.throw;
                (0, _chai.expect)(function () {
                    atriple[2] = 'b';
                }).to.throw;
            });
            it('are true iterables, and therefore allow positional destructuring', function () {
                var _Tuple$Triple = _classes.Tuple.Triple(true, 12, 'a'),
                    _Tuple$Triple2 = _slicedToArray(_Tuple$Triple, 3),
                    a = _Tuple$Triple2[0],
                    b = _Tuple$Triple2[1],
                    c = _Tuple$Triple2[2];

                (0, _chai.expect)(a).to.be.eql(true);
                (0, _chai.expect)(b).to.be.eql(12);
                (0, _chai.expect)(c).to.be.eql('a');
            });
        });

        describe('success and failure', function () {
            beforeEach(function () {});
            it('may represent successes', function () {
                var succ = (0, _classes.success)(true, 12);
                (0, _chai.expect)(succ[0]).to.be.true;
                (0, _chai.expect)(succ[1]).to.be.eql(12);
                (0, _chai.expect)((0, _util.isSuccess)(succ)).to.be.true;
                (0, _chai.expect)((0, _util.isPair)(succ)).to.be.true;
            });
            it('may represent failures', function () {
                var fail = (0, _classes.failure)('a', 12);
                (0, _chai.expect)(fail[0]).to.be.eql('a');
                (0, _chai.expect)(fail[1]).to.be.eql(12);
                (0, _chai.expect)((0, _util.isSuccess)(fail)).to.be.false;
                (0, _chai.expect)((0, _util.isFailure)(fail)).to.be.true;
                (0, _chai.expect)((0, _util.isPair)(fail)).to.be.true;
            });
        });
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzLXNwZWMvY2xhc3Nlc190ZXN0cy5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsImpzdHJpbmciLCJKU3RyaW5nIiwiaXQiLCJ2YWx1ZSIsInRvIiwiYmUiLCJlcWwiLCJ0b1N0cmluZyIsInRocm93IiwiaXNKVmFsdWUiLCJ0cnVlIiwiaXNKU3RyaW5nIiwiam51bWJlciIsIkpOdW1iZXIiLCJpc0pOdW1iZXIiLCJOYU4iLCJqYm9vbCIsIkpCb29sIiwiaXNKQm9vbCIsImpudWxsIiwiSk51bGwiLCJudWxsIiwiaXNKTnVsbCIsInVuZGVmaW5lZCIsImphcnJheSIsIkpBcnJheSIsImphclZhbHVlIiwiaXNKQXJyYXkiLCJyb3dzIiwicG9zMDAiLCJpc1Bvc2l0aW9uIiwiY2hhciIsImlzSnVzdCIsInBvczExIiwicG9zMDEiLCJpbmNyUG9zIiwicG9zMjAiLCJwb3MxMDEwIiwiaXNOb3RoaW5nIiwicG9zMjMiLCJmcm9tVGV4dCIsInJlc3QiLCJhU29tZSIsInZhbCIsImFOb25lIiwiYXBhaXIiLCJ0eXBlIiwiYSIsImIiLCJQYWlyIiwiaXNQYWlyIiwiYXRyaXBsZSIsIlRyaXBsZSIsImlzVHJpcGxlIiwiYyIsImJlZm9yZUVhY2giLCJzdWNjIiwiZmFpbCIsImZhbHNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQUEsYUFBUyxzQkFBVCxFQUFpQyxZQUFNOztBQUVuQ0EsaUJBQVMsa0NBQVQsRUFBNkMsWUFBTTtBQUMvQ0EscUJBQVMsOENBQVQsRUFBeUQsWUFBTTtBQUMzRCxvQkFBTUMsVUFBVSxnQkFBT0MsT0FBUCxDQUFlLEtBQWYsQ0FBaEI7QUFDQUMsbUJBQUcsc0JBQUgsRUFBMkIsWUFBTTtBQUM3QixzQ0FBT0YsUUFBUUcsS0FBZixFQUFzQkMsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCQyxHQUE1QixDQUFnQyxLQUFoQztBQUNBLHNDQUFPTixRQUFRTyxRQUFSLEVBQVAsRUFBMkJILEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMsY0FBckM7QUFDSCxpQkFIRDtBQUlBSixtQkFBRyxvQkFBSCxFQUF5QixZQUFNO0FBQzNCLHNDQUFPLFlBQU07QUFDVEYsZ0NBQVFHLEtBQVIsR0FBZ0IsS0FBaEI7QUFDSCxxQkFGRCxFQUVHQyxFQUZILENBRU1JLEtBRk47QUFHSCxpQkFKRDtBQUtBTixtQkFBRyx1QkFBSCxFQUE0QixZQUFNO0FBQzlCLHNDQUFPO0FBQUEsK0JBQU0sZ0JBQU9ELE9BQVAsQ0FBZSxHQUFmLENBQU47QUFBQSxxQkFBUCxFQUFrQ0csRUFBbEMsQ0FBcUNJLEtBQXJDO0FBQ0gsaUJBRkQ7QUFHQU4sbUJBQUcsc0NBQUgsRUFBMkMsWUFBTTtBQUM3Qyx3QkFBTUYsVUFBVSxnQkFBT0MsT0FBUCxDQUFlLEtBQWYsQ0FBaEI7QUFDQSxzQ0FBT0QsUUFBUVMsUUFBZixFQUF5QkwsRUFBekIsQ0FBNEJDLEVBQTVCLENBQStCSyxJQUEvQjtBQUNBLHNDQUFPVixRQUFRVyxTQUFmLEVBQTBCUCxFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NLLElBQWhDO0FBQ0gsaUJBSkQ7QUFLSCxhQW5CRDtBQW9CQVIsZUFBRyw2Q0FBSCxFQUFrRCxZQUFNO0FBQ3BELG9CQUFNVSxVQUFVLGdCQUFPQyxPQUFQLENBQWUsVUFBZixDQUFoQjtBQUNBLGtDQUFPRCxRQUFRVCxLQUFmLEVBQXNCQyxFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJDLEdBQTVCLENBQWdDLFVBQWhDO0FBQ0Esa0NBQU9NLFFBQVFMLFFBQVIsRUFBUCxFQUEyQkgsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxxQkFBckM7QUFDQSxrQ0FBT00sUUFBUUgsUUFBZixFQUF5QkwsRUFBekIsQ0FBNEJDLEVBQTVCLENBQStCSyxJQUEvQjtBQUNBLGtDQUFPRSxRQUFRRSxTQUFmLEVBQTBCVixFQUExQixDQUE2QkMsRUFBN0IsQ0FBZ0NLLElBQWhDO0FBQ0Esa0NBQU8sWUFBTTtBQUNURSw0QkFBUVQsS0FBUixHQUFnQixHQUFoQjtBQUNILGlCQUZELEVBRUdDLEVBRkgsQ0FFTUksS0FGTjtBQUdBLGtDQUFPO0FBQUEsMkJBQU0sZ0JBQU9LLE9BQVAsQ0FBZSxHQUFmLENBQU47QUFBQSxpQkFBUCxFQUFrQ1QsRUFBbEMsQ0FBcUNJLEtBQXJDO0FBQ0Esa0NBQU87QUFBQSwyQkFBTSxnQkFBT0ssT0FBUCxDQUFlRSxHQUFmLENBQU47QUFBQSxpQkFBUCxFQUFrQ1gsRUFBbEMsQ0FBcUNJLEtBQXJDO0FBQ0gsYUFYRDtBQVlBTixlQUFHLDZDQUFILEVBQWtELFlBQU07QUFDcEQsb0JBQU1jLFFBQVEsZ0JBQU9DLEtBQVAsQ0FBYSxJQUFiLENBQWQ7QUFDQSxrQ0FBT0QsTUFBTWIsS0FBYixFQUFvQkMsRUFBcEIsQ0FBdUJDLEVBQXZCLENBQTBCSyxJQUExQjtBQUNBLGtDQUFPTSxNQUFNVCxRQUFOLEVBQVAsRUFBeUJILEVBQXpCLENBQTRCQyxFQUE1QixDQUErQkMsR0FBL0IsQ0FBbUMsYUFBbkM7QUFDQSxrQ0FBT1UsTUFBTVAsUUFBYixFQUF1QkwsRUFBdkIsQ0FBMEJDLEVBQTFCLENBQTZCSyxJQUE3QjtBQUNBLGtDQUFPTSxNQUFNRSxPQUFiLEVBQXNCZCxFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJLLElBQTVCO0FBQ0Esa0NBQU8sWUFBTTtBQUNUTSwwQkFBTWIsS0FBTixHQUFjLEtBQWQ7QUFDSCxpQkFGRCxFQUVHQyxFQUZILENBRU1JLEtBRk47QUFHQSxrQ0FBTztBQUFBLDJCQUFNLGdCQUFPUyxLQUFQLENBQWEsR0FBYixDQUFOO0FBQUEsaUJBQVAsRUFBZ0NiLEVBQWhDLENBQW1DSSxLQUFuQztBQUNBLGtDQUFPO0FBQUEsMkJBQU0sZ0JBQU9TLEtBQVAsQ0FBYSxHQUFiLENBQU47QUFBQSxpQkFBUCxFQUFnQ2IsRUFBaEMsQ0FBbUNJLEtBQW5DO0FBQ0Esa0NBQU87QUFBQSwyQkFBTSxnQkFBT1MsS0FBUCxDQUFhRixHQUFiLENBQU47QUFBQSxpQkFBUCxFQUFnQ1gsRUFBaEMsQ0FBbUNJLEtBQW5DO0FBQ0gsYUFaRDtBQWFBTixlQUFHLDBDQUFILEVBQStDLFlBQU07QUFDakQsb0JBQU1pQixRQUFRLGdCQUFPQyxLQUFQLENBQWEsSUFBYixDQUFkO0FBQ0Esa0NBQU9ELE1BQU1oQixLQUFiLEVBQW9CQyxFQUFwQixDQUF1QkMsRUFBdkIsQ0FBMEJnQixJQUExQjtBQUNBLGtDQUFPRixNQUFNWixRQUFOLEVBQVAsRUFBeUJILEVBQXpCLENBQTRCQyxFQUE1QixDQUErQkMsR0FBL0IsQ0FBbUMsYUFBbkM7QUFDQSxrQ0FBT2EsTUFBTVYsUUFBYixFQUF1QkwsRUFBdkIsQ0FBMEJDLEVBQTFCLENBQTZCSyxJQUE3QjtBQUNBLGtDQUFPUyxNQUFNRyxPQUFiLEVBQXNCbEIsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCSyxJQUE1QjtBQUNBLGtDQUFPLFlBQU07QUFDVFMsMEJBQU1oQixLQUFOLEdBQWMsR0FBZDtBQUNILGlCQUZELEVBRUdDLEVBRkgsQ0FFTUksS0FGTjtBQUdBLGtDQUFPO0FBQUEsMkJBQU0sZ0JBQU9ZLEtBQVAsQ0FBYSxFQUFiLENBQU47QUFBQSxpQkFBUCxFQUErQmhCLEVBQS9CLENBQWtDSSxLQUFsQztBQUNBLGtDQUFPO0FBQUEsMkJBQU0sZ0JBQU9ZLEtBQVAsQ0FBYUcsU0FBYixDQUFOO0FBQUEsaUJBQVAsRUFBc0NuQixFQUF0QyxDQUF5Q0ksS0FBekM7QUFDQSxrQ0FBTztBQUFBLDJCQUFNLGdCQUFPWSxLQUFQLENBQWFMLEdBQWIsQ0FBTjtBQUFBLGlCQUFQLEVBQWdDWCxFQUFoQyxDQUFtQ0ksS0FBbkM7QUFDSCxhQVpEO0FBYUFOLGVBQUcsc0NBQUgsRUFBMkMsWUFBTTtBQUM3QyxvQkFBTXNCLFNBQVMsZ0JBQU9DLE1BQVAsQ0FBYyxnQkFBT3hCLE9BQVAsQ0FBZSxHQUFmLENBQWQsRUFBbUMsZ0JBQU9nQixLQUFQLENBQWEsS0FBYixDQUFuQyxFQUF3RCxnQkFBT0csS0FBUCxDQUFhLElBQWIsQ0FBeEQsQ0FBZjtBQUNBLG9CQUFNTSxXQUFXRixPQUFPckIsS0FBeEI7QUFDQSxrQ0FBT3VCLFNBQVMsQ0FBVCxFQUFZdkIsS0FBbkIsRUFBMEJDLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsR0FBcEM7QUFDQSxrQ0FBT29CLFNBQVMsQ0FBVCxFQUFZdkIsS0FBbkIsRUFBMEJDLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsS0FBcEM7QUFDQSxrQ0FBT29CLFNBQVMsQ0FBVCxFQUFZdkIsS0FBbkIsRUFBMEJDLEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsSUFBcEM7QUFDQSxrQ0FBT2tCLE9BQU9qQixRQUFQLEVBQVAsRUFBMEJILEVBQTFCLENBQTZCQyxFQUE3QixDQUFnQ0MsR0FBaEMsQ0FBb0MsZ0RBQXBDO0FBQ0Esa0NBQU9rQixPQUFPZixRQUFkLEVBQXdCTCxFQUF4QixDQUEyQkMsRUFBM0IsQ0FBOEJLLElBQTlCO0FBQ0Esa0NBQU9jLE9BQU9HLFFBQWQsRUFBd0J2QixFQUF4QixDQUEyQkMsRUFBM0IsQ0FBOEJLLElBQTlCO0FBQ0Esa0NBQU8sWUFBTTtBQUNUYywyQkFBT3JCLEtBQVAsR0FBZSxHQUFmO0FBQ0gsaUJBRkQsRUFFR0MsRUFGSCxDQUVNSSxLQUZOO0FBR0Esa0NBQU87QUFBQSwyQkFBTSxnQkFBT2lCLE1BQVAsQ0FBYyxFQUFkLENBQU47QUFBQSxpQkFBUCxFQUFnQ3JCLEVBQWhDLENBQW1DSSxLQUFuQztBQUNBLGtDQUFPO0FBQUEsMkJBQU0sZ0JBQU9ZLEtBQVAsQ0FBYUcsU0FBYixDQUFOO0FBQUEsaUJBQVAsRUFBc0NuQixFQUF0QyxDQUF5Q0ksS0FBekM7QUFDQSxrQ0FBTztBQUFBLDJCQUFNLGdCQUFPWSxLQUFQLENBQWFMLEdBQWIsQ0FBTjtBQUFBLGlCQUFQLEVBQWdDWCxFQUFoQyxDQUFtQ0ksS0FBbkM7QUFDSCxhQWZEO0FBaUJILFNBNUVEOztBQThFQVQsaUJBQVMsYUFBVCxFQUF3QixZQUFNO0FBQzFCLGdCQUFNNkIsT0FBTyxDQUNULENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRFMsRUFFVCxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixDQUZTLEVBR1QsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FIUyxDQUFiO0FBS0ExQixlQUFHLDREQUFILEVBQWlFLFlBQU07QUFDbkUsb0JBQU0yQixRQUFRLHVCQUFTRCxJQUFULEVBQWUsQ0FBZixFQUFrQixDQUFsQixDQUFkO0FBQ0Esa0NBQU9DLE1BQU1DLFVBQWIsRUFBeUIxQixFQUF6QixDQUE0QkMsRUFBNUIsQ0FBK0JLLElBQS9CO0FBQ0Esa0NBQU9tQixNQUFNRSxJQUFOLEdBQWFDLE1BQXBCLEVBQTRCNUIsRUFBNUIsQ0FBK0JDLEVBQS9CLENBQWtDSyxJQUFsQztBQUNBLGtDQUFPbUIsTUFBTUUsSUFBTixHQUFhNUIsS0FBcEIsRUFBMkJDLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMsQ0FBckM7QUFDQSxvQkFBTTJCLFFBQVEsdUJBQVNMLElBQVQsRUFBZSxDQUFmLEVBQWtCLENBQWxCLENBQWQ7QUFDQSxrQ0FBT0ssTUFBTUYsSUFBTixHQUFhQyxNQUFwQixFQUE0QjVCLEVBQTVCLENBQStCQyxFQUEvQixDQUFrQ0ssSUFBbEM7QUFDQSxrQ0FBT3VCLE1BQU1GLElBQU4sR0FBYTVCLEtBQXBCLEVBQTJCQyxFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUNDLEdBQWpDLENBQXFDLEdBQXJDO0FBQ0gsYUFSRDtBQVNBSixlQUFHLDREQUFILEVBQWlFLFlBQU07QUFDbkUsb0JBQU1nQyxRQUFRLHVCQUFTTixJQUFULEVBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQk8sT0FBckIsRUFBZDtBQUNBLGtDQUFPRCxNQUFNSCxJQUFOLEdBQWE1QixLQUFwQixFQUEyQkMsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxDQUFyQztBQUNBLG9CQUFNOEIsUUFBUSx1QkFBU1IsSUFBVCxFQUFlLENBQWYsRUFBa0IsQ0FBbEIsRUFBcUJPLE9BQXJCLEVBQWQ7QUFDQSxrQ0FBT0MsTUFBTUwsSUFBTixHQUFhNUIsS0FBcEIsRUFBMkJDLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMsR0FBckM7QUFDSCxhQUxEO0FBTUFKLGVBQUcsbUVBQUgsRUFBd0UsWUFBTTtBQUMxRSxvQkFBTW1DLFVBQVUsdUJBQVNULElBQVQsRUFBZSxFQUFmLEVBQW1CLEVBQW5CLENBQWhCO0FBQ0Esa0NBQU9TLFFBQVFOLElBQVIsR0FBZU8sU0FBdEIsRUFBaUNsQyxFQUFqQyxDQUFvQ0MsRUFBcEMsQ0FBdUNLLElBQXZDO0FBQ0Esb0JBQU02QixRQUFRLHVCQUFTWCxJQUFULEVBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQk8sT0FBckIsRUFBZDtBQUNBLGtDQUFPSSxNQUFNUixJQUFOLEdBQWFPLFNBQXBCLEVBQStCbEMsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDSyxJQUFyQztBQUNILGFBTEQ7QUFNQVIsZUFBRyxzQ0FBSCxFQUEyQyxZQUFNO0FBQzdDLG9CQUFNMkIsUUFBUSxrQkFBU1csUUFBVCxDQUFrQiw0QkFBbEIsQ0FBZDtBQUNBLGtDQUFPWCxNQUFNRSxJQUFOLEdBQWE1QixLQUFwQixFQUEyQkMsRUFBM0IsQ0FBOEJDLEVBQTlCLENBQWlDQyxHQUFqQyxDQUFxQyxHQUFyQztBQUNBLGtDQUFPdUIsTUFBTU0sT0FBTixHQUFnQkEsT0FBaEIsR0FBMEJBLE9BQTFCLEdBQW9DQSxPQUFwQyxHQUNGSixJQURFLEdBQ0s1QixLQURaLEVBQ21CQyxFQURuQixDQUNzQkMsRUFEdEIsQ0FDeUJDLEdBRHpCLENBQzZCLEdBRDdCO0FBRUgsYUFMRDtBQU1BSixlQUFHLDhFQUFILEVBQW1GLFlBQU07QUFDckYsb0JBQU0yQixRQUFRLGtCQUFTVyxRQUFULENBQWtCLGVBQWxCLENBQWQ7QUFDQSxrQ0FBT1gsTUFBTUUsSUFBTixHQUFhNUIsS0FBcEIsRUFBMkJDLEVBQTNCLENBQThCQyxFQUE5QixDQUFpQ0MsR0FBakMsQ0FBcUMsR0FBckM7QUFDQSxrQ0FBT3VCLE1BQU1NLE9BQU4sR0FBZ0JBLE9BQWhCLEdBQTBCQSxPQUExQixHQUFvQ0EsT0FBcEMsR0FBOENBLE9BQTlDLEdBQXdEQSxPQUF4RCxHQUNGSixJQURFLEdBQ0s1QixLQURaLEVBQ21CQyxFQURuQixDQUNzQkMsRUFEdEIsQ0FDeUJDLEdBRHpCLENBQzZCLEdBRDdCO0FBRUgsYUFMRDtBQU1BSixlQUFHLGtHQUFILEVBQXVHLFlBQU07QUFDekcsb0JBQU1nQyxRQUFRLGtCQUFTTSxRQUFULENBQWtCLE9BQWxCLEVBQTJCTCxPQUEzQixFQUFkO0FBQ0Esa0NBQU9ELE1BQU1PLElBQU4sRUFBUCxFQUFxQnJDLEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQkMsR0FBM0IsQ0FBK0IsTUFBL0I7QUFDSCxhQUhEO0FBSUgsU0EzQ0Q7O0FBNkNBUCxpQkFBUyxPQUFULEVBQWtCLFlBQU07QUFDcEJHLGVBQUcsMENBQUgsRUFBK0MsWUFBTTtBQUNqRCxvQkFBTXdDLFFBQVEsbUJBQUssRUFBTCxDQUFkO0FBQ0Esa0NBQU9BLE1BQU1DLEdBQU4sRUFBUCxFQUFvQnZDLEVBQXBCLENBQXVCQyxFQUF2QixDQUEwQkMsR0FBMUIsQ0FBOEIsRUFBOUI7QUFDQSxrQ0FBTyxrQkFBT29DLEtBQVAsQ0FBUCxFQUFzQnRDLEVBQXRCLENBQXlCQyxFQUF6QixDQUE0QkssSUFBNUI7QUFDQSxrQ0FBT2dDLE1BQU1uQyxRQUFOLEVBQVAsRUFBeUJILEVBQXpCLENBQTRCQyxFQUE1QixDQUErQkMsR0FBL0IsQ0FBbUMsVUFBbkM7QUFDSCxhQUxEO0FBTUgsU0FQRDs7QUFTQVAsaUJBQVMsT0FBVCxFQUFrQixZQUFNO0FBQ3BCRyxlQUFHLHFCQUFILEVBQTBCLFlBQU07QUFDNUIsb0JBQU0wQyxRQUFRLG9CQUFkO0FBQ0Esa0NBQU9BLE1BQU1ELEdBQU4sRUFBUCxFQUFvQnZDLEVBQXBCLENBQXVCQyxFQUF2QixDQUEwQmdCLElBQTFCO0FBQ0Esa0NBQU8sa0JBQU91QixLQUFQLENBQVAsRUFBc0J4QyxFQUF0QixDQUF5QkMsRUFBekIsQ0FBNEJLLElBQTVCO0FBQ0Esa0NBQU9rQyxNQUFNckMsUUFBTixFQUFQLEVBQXlCSCxFQUF6QixDQUE0QkMsRUFBNUIsQ0FBK0JDLEdBQS9CLENBQW1DLFFBQW5DO0FBQ0gsYUFMRDtBQU1ILFNBUEQ7O0FBU0FQLGlCQUFTLE9BQVQsRUFBa0IsWUFBTTtBQUNwQkcsZUFBRyw2Q0FBSCxFQUFrRCxZQUFNO0FBQ3BELG9CQUFNMkMsUUFBUSxtQkFBSyxJQUFMLEVBQVcsRUFBWCxDQUFkO0FBQ0Esa0NBQU9BLE1BQU0sQ0FBTixDQUFQLEVBQWlCekMsRUFBakIsQ0FBb0JDLEVBQXBCLENBQXVCQyxHQUF2QixDQUEyQixJQUEzQjtBQUNBLGtDQUFPdUMsTUFBTSxDQUFOLENBQVAsRUFBaUJ6QyxFQUFqQixDQUFvQkMsRUFBcEIsQ0FBdUJDLEdBQXZCLENBQTJCLEVBQTNCO0FBQ0Esa0NBQU91QyxNQUFNQyxJQUFiLEVBQW1CMUMsRUFBbkIsQ0FBc0JDLEVBQXRCLENBQXlCQyxHQUF6QixDQUE2QixNQUE3QjtBQUNBLGtDQUFPLGtCQUFPdUMsS0FBUCxDQUFQLEVBQXNCekMsRUFBdEIsQ0FBeUJDLEVBQXpCLENBQTRCSyxJQUE1QjtBQUNILGFBTkQ7QUFPQVIsZUFBRyxtRUFBSCxFQUF3RSxZQUFNO0FBQUEsNEJBQzNELG1CQUFLLElBQUwsRUFBVyxFQUFYLENBRDJEO0FBQUE7QUFBQSxvQkFDbkU2QyxDQURtRTtBQUFBLG9CQUNoRUMsQ0FEZ0U7O0FBRTFFLGtDQUFPRCxDQUFQLEVBQVUzQyxFQUFWLENBQWFDLEVBQWIsQ0FBZ0JDLEdBQWhCLENBQW9CLElBQXBCO0FBQ0Esa0NBQU8wQyxDQUFQLEVBQVU1QyxFQUFWLENBQWFDLEVBQWIsQ0FBZ0JDLEdBQWhCLENBQW9CLEVBQXBCO0FBQ0gsYUFKRDtBQUtILFNBYkQ7O0FBZUFQLGlCQUFTLFNBQVQsRUFBb0IsWUFBTTtBQUN0QkcsZUFBRyw2Q0FBSCxFQUFrRCxZQUFNO0FBQ3BELG9CQUFNMkMsUUFBUSxlQUFNSSxJQUFOLENBQVcsSUFBWCxFQUFpQixFQUFqQixDQUFkO0FBQ0Esa0NBQU9KLE1BQU0sQ0FBTixDQUFQLEVBQWlCekMsRUFBakIsQ0FBb0JDLEVBQXBCLENBQXVCQyxHQUF2QixDQUEyQixJQUEzQjtBQUNBLGtDQUFPdUMsTUFBTSxDQUFOLENBQVAsRUFBaUJ6QyxFQUFqQixDQUFvQkMsRUFBcEIsQ0FBdUJDLEdBQXZCLENBQTJCLEVBQTNCO0FBQ0Esa0NBQU91QyxNQUFNQyxJQUFiLEVBQW1CMUMsRUFBbkIsQ0FBc0JDLEVBQXRCLENBQXlCQyxHQUF6QixDQUE2QixNQUE3QjtBQUNBLGtDQUFPdUMsTUFBTUssTUFBYixFQUFxQjlDLEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQkssSUFBM0I7QUFDQSxrQ0FBT21DLE1BQU10QyxRQUFOLEVBQVAsRUFBeUJILEVBQXpCLENBQTRCQyxFQUE1QixDQUErQkMsR0FBL0IsQ0FBbUMsV0FBbkM7QUFDSCxhQVBEO0FBUUFKLGVBQUcsb0RBQUgsRUFBeUQsWUFBTTtBQUMzRCxvQkFBTTJDLFFBQVEsZUFBTUksSUFBTixDQUFXLElBQVgsRUFBaUIsRUFBakIsQ0FBZDtBQUNBLGtDQUFPLFlBQU07QUFDVEUsNEJBQVEsQ0FBUixJQUFhLEtBQWI7QUFDSCxpQkFGRCxFQUVHL0MsRUFGSCxDQUVNSSxLQUZOO0FBR0Esa0NBQU8sWUFBTTtBQUNUMkMsNEJBQVEsQ0FBUixJQUFhLEVBQWI7QUFDSCxpQkFGRCxFQUVHL0MsRUFGSCxDQUVNSSxLQUZOO0FBR0gsYUFSRDtBQVNBTixlQUFHLGtFQUFILEVBQXVFLFlBQU07QUFBQSxrQ0FDMUQsZUFBTStDLElBQU4sQ0FBVyxJQUFYLEVBQWlCLEVBQWpCLENBRDBEO0FBQUE7QUFBQSxvQkFDbEVGLENBRGtFO0FBQUEsb0JBQy9EQyxDQUQrRDs7QUFFekUsa0NBQU9ELENBQVAsRUFBVTNDLEVBQVYsQ0FBYUMsRUFBYixDQUFnQkMsR0FBaEIsQ0FBb0IsSUFBcEI7QUFDQSxrQ0FBTzBDLENBQVAsRUFBVTVDLEVBQVYsQ0FBYUMsRUFBYixDQUFnQkMsR0FBaEIsQ0FBb0IsRUFBcEI7QUFDSCxhQUpEO0FBS0gsU0F2QkQ7O0FBeUJBUCxpQkFBUyxXQUFULEVBQXNCLFlBQU07QUFDeEJHLGVBQUcsNkNBQUgsRUFBa0QsWUFBTTtBQUNwRCxvQkFBTWlELFVBQVUsZUFBTUMsTUFBTixDQUFhLElBQWIsRUFBbUIsRUFBbkIsRUFBdUIsR0FBdkIsQ0FBaEI7QUFDQSxrQ0FBT0QsUUFBUSxDQUFSLENBQVAsRUFBbUIvQyxFQUFuQixDQUFzQkMsRUFBdEIsQ0FBeUJDLEdBQXpCLENBQTZCLElBQTdCO0FBQ0Esa0NBQU82QyxRQUFRLENBQVIsQ0FBUCxFQUFtQi9DLEVBQW5CLENBQXNCQyxFQUF0QixDQUF5QkMsR0FBekIsQ0FBNkIsRUFBN0I7QUFDQSxrQ0FBTzZDLFFBQVEsQ0FBUixDQUFQLEVBQW1CL0MsRUFBbkIsQ0FBc0JDLEVBQXRCLENBQXlCQyxHQUF6QixDQUE2QixHQUE3QjtBQUNBLGtDQUFPNkMsUUFBUUwsSUFBZixFQUFxQjFDLEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQkMsR0FBM0IsQ0FBK0IsUUFBL0I7QUFDQSxrQ0FBTzZDLFFBQVFFLFFBQWYsRUFBeUJqRCxFQUF6QixDQUE0QkMsRUFBNUIsQ0FBK0JLLElBQS9CO0FBQ0Esa0NBQU95QyxRQUFRNUMsUUFBUixFQUFQLEVBQTJCSCxFQUEzQixDQUE4QkMsRUFBOUIsQ0FBaUNDLEdBQWpDLENBQXFDLGFBQXJDO0FBQ0gsYUFSRDtBQVNBSixlQUFHLG9EQUFILEVBQXlELFlBQU07QUFDM0Qsb0JBQU1pRCxVQUFVLGVBQU1DLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLEVBQW5CLEVBQXVCLEdBQXZCLENBQWhCO0FBQ0Esa0NBQU8sWUFBTTtBQUNURCw0QkFBUSxDQUFSLElBQWEsS0FBYjtBQUNILGlCQUZELEVBRUcvQyxFQUZILENBRU1JLEtBRk47QUFHQSxrQ0FBTyxZQUFNO0FBQ1QyQyw0QkFBUSxDQUFSLElBQWEsRUFBYjtBQUNILGlCQUZELEVBRUcvQyxFQUZILENBRU1JLEtBRk47QUFHQSxrQ0FBTyxZQUFNO0FBQ1QyQyw0QkFBUSxDQUFSLElBQWEsR0FBYjtBQUNILGlCQUZELEVBRUcvQyxFQUZILENBRU1JLEtBRk47QUFHSCxhQVhEO0FBWUFOLGVBQUcsa0VBQUgsRUFBdUUsWUFBTTtBQUFBLG9DQUN2RCxlQUFNa0QsTUFBTixDQUFhLElBQWIsRUFBbUIsRUFBbkIsRUFBdUIsR0FBdkIsQ0FEdUQ7QUFBQTtBQUFBLG9CQUNsRUwsQ0FEa0U7QUFBQSxvQkFDL0RDLENBRCtEO0FBQUEsb0JBQzVETSxDQUQ0RDs7QUFFekUsa0NBQU9QLENBQVAsRUFBVTNDLEVBQVYsQ0FBYUMsRUFBYixDQUFnQkMsR0FBaEIsQ0FBb0IsSUFBcEI7QUFDQSxrQ0FBTzBDLENBQVAsRUFBVTVDLEVBQVYsQ0FBYUMsRUFBYixDQUFnQkMsR0FBaEIsQ0FBb0IsRUFBcEI7QUFDQSxrQ0FBT2dELENBQVAsRUFBVWxELEVBQVYsQ0FBYUMsRUFBYixDQUFnQkMsR0FBaEIsQ0FBb0IsR0FBcEI7QUFDSCxhQUxEO0FBTUgsU0E1QkQ7O0FBOEJBUCxpQkFBUyxxQkFBVCxFQUFnQyxZQUFNO0FBQ2xDd0QsdUJBQVcsWUFBTSxDQUNoQixDQUREO0FBRUFyRCxlQUFHLHlCQUFILEVBQThCLFlBQU07QUFDaEMsb0JBQU1zRCxPQUFPLHNCQUFRLElBQVIsRUFBYyxFQUFkLENBQWI7QUFDQSxrQ0FBT0EsS0FBSyxDQUFMLENBQVAsRUFBZ0JwRCxFQUFoQixDQUFtQkMsRUFBbkIsQ0FBc0JLLElBQXRCO0FBQ0Esa0NBQU84QyxLQUFLLENBQUwsQ0FBUCxFQUFnQnBELEVBQWhCLENBQW1CQyxFQUFuQixDQUFzQkMsR0FBdEIsQ0FBMEIsRUFBMUI7QUFDQSxrQ0FBTyxxQkFBVWtELElBQVYsQ0FBUCxFQUF3QnBELEVBQXhCLENBQTJCQyxFQUEzQixDQUE4QkssSUFBOUI7QUFDQSxrQ0FBTyxrQkFBTzhDLElBQVAsQ0FBUCxFQUFxQnBELEVBQXJCLENBQXdCQyxFQUF4QixDQUEyQkssSUFBM0I7QUFDSCxhQU5EO0FBT0FSLGVBQUcsd0JBQUgsRUFBNkIsWUFBTTtBQUMvQixvQkFBTXVELE9BQU8sc0JBQVEsR0FBUixFQUFhLEVBQWIsQ0FBYjtBQUNBLGtDQUFPQSxLQUFLLENBQUwsQ0FBUCxFQUFnQnJELEVBQWhCLENBQW1CQyxFQUFuQixDQUFzQkMsR0FBdEIsQ0FBMEIsR0FBMUI7QUFDQSxrQ0FBT21ELEtBQUssQ0FBTCxDQUFQLEVBQWdCckQsRUFBaEIsQ0FBbUJDLEVBQW5CLENBQXNCQyxHQUF0QixDQUEwQixFQUExQjtBQUNBLGtDQUFPLHFCQUFVbUQsSUFBVixDQUFQLEVBQXdCckQsRUFBeEIsQ0FBMkJDLEVBQTNCLENBQThCcUQsS0FBOUI7QUFDQSxrQ0FBTyxxQkFBVUQsSUFBVixDQUFQLEVBQXdCckQsRUFBeEIsQ0FBMkJDLEVBQTNCLENBQThCSyxJQUE5QjtBQUNBLGtDQUFPLGtCQUFPK0MsSUFBUCxDQUFQLEVBQXFCckQsRUFBckIsQ0FBd0JDLEVBQXhCLENBQTJCSyxJQUEzQjtBQUNILGFBUEQ7QUFRSCxTQWxCRDtBQW1CSCxLQXhPRCIsImZpbGUiOiJjbGFzc2VzX3Rlc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtleHBlY3R9IGZyb20gJ2NoYWknO1xuaW1wb3J0IHtcbiAgICBpc1BhaXIsXG4gICAgaXNTdWNjZXNzLFxuICAgIGlzRmFpbHVyZSxcbiAgICBpc1NvbWUsXG4gICAgaXNOb25lLFxufSBmcm9tICd1dGlsJztcbmltcG9ydCB7XG4gICAgcGFpcixcbiAgICBzdWNjZXNzLFxuICAgIGZhaWx1cmUsXG4gICAgc29tZSxcbiAgICBub25lLFxuICAgIFBvc2l0aW9uLFxuICAgIFR1cGxlLFxuICAgIEpWYWx1ZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5cbmRlc2NyaWJlKCdhbW9uZyBoZWxwZXIgY2xhc3NlcycsICgpID0+IHtcblxuICAgIGRlc2NyaWJlKCdKVmFsdWVcXCdzIGFyZSBwYXJzZWQgSlNPTiB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICAgIGRlc2NyaWJlKCd3aXRoIEpTdHJpbmdcXCdzIGFzIHBhcnNlZCBKU09OIHN0cmluZyB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBqc3RyaW5nID0gSlZhbHVlLkpTdHJpbmcoJ2FiYycpO1xuICAgICAgICAgICAgaXQoJ3RoYXQgYXJlIHJldHJpZXZhYmxlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChqc3RyaW5nLnZhbHVlKS50by5iZS5lcWwoJ2FiYycpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChqc3RyaW5nLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSlN0cmluZyhhYmMpJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCd0aGF0IGFyZSBpbW11dGFibGUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAganN0cmluZy52YWx1ZSA9ICdkZWYnO1xuICAgICAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgndGhhdCBnb3R0YSBiZSBzdHJpbmdzJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSlN0cmluZygxMjMpKS50by50aHJvdztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3RoYXQgZ290dGEgYnkgdHlwZXMgd2l0aCBhIHN1cGVydHlwZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBqc3RyaW5nID0gSlZhbHVlLkpTdHJpbmcoJzEyMycpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChqc3RyaW5nLmlzSlZhbHVlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgICAgIGV4cGVjdChqc3RyaW5nLmlzSlN0cmluZykudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3dpdGggSk51bWJlclxcJ3MgYXMgcGFyc2VkIEpTT04gZmxvYXQgdmFsdWVzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgam51bWJlciA9IEpWYWx1ZS5KTnVtYmVyKDEyMy40NWUtMjMpO1xuICAgICAgICAgICAgZXhwZWN0KGpudW1iZXIudmFsdWUpLnRvLmJlLmVxbCgxMjMuNDVlLTIzKTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVtYmVyLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSk51bWJlcigxLjIzNDVlLTIxKScpO1xuICAgICAgICAgICAgZXhwZWN0KGpudW1iZXIuaXNKVmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3Qoam51bWJlci5pc0pOdW1iZXIpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGpudW1iZXIudmFsdWUgPSAxMjM7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bWJlcigneCcpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bWJlcihOYU4pKS50by50aHJvdztcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCd3aXRoIEpCb29sXFwncyBhcyBwYXJzZWQgSlNPTiBib29sZWFuIHZhbHVlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpib29sID0gSlZhbHVlLkpCb29sKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGpib29sLnZhbHVlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGpib29sLnRvU3RyaW5nKCkpLnRvLmJlLmVxbCgnSkJvb2wodHJ1ZSknKTtcbiAgICAgICAgICAgIGV4cGVjdChqYm9vbC5pc0pWYWx1ZSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqYm9vbC5pc0pCb29sKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBqYm9vbC52YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpCb29sKCd4JykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KQm9vbCgxMjMpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSkJvb2woTmFOKSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnd2l0aCBKTnVsbFxcJ3MgYXMgcGFyc2VkIEpTT04gbnVsbCB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBqbnVsbCA9IEpWYWx1ZS5KTnVsbChudWxsKTtcbiAgICAgICAgICAgIGV4cGVjdChqbnVsbC52YWx1ZSkudG8uYmUubnVsbDtcbiAgICAgICAgICAgIGV4cGVjdChqbnVsbC50b1N0cmluZygpKS50by5iZS5lcWwoJ0pOdWxsKG51bGwpJyk7XG4gICAgICAgICAgICBleHBlY3Qoam51bGwuaXNKVmFsdWUpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3Qoam51bGwuaXNKTnVsbCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgam51bGwudmFsdWUgPSAxMjM7XG4gICAgICAgICAgICB9KS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bGwoJycpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bGwodW5kZWZpbmVkKSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpOdWxsKE5hTikpLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3dpdGggSkFycmF5XFwncyBhcyBwYXJzZWQgSlNPTiBhcnJheXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBqYXJyYXkgPSBKVmFsdWUuSkFycmF5KEpWYWx1ZS5KU3RyaW5nKCdhJyksIEpWYWx1ZS5KQm9vbChmYWxzZSksIEpWYWx1ZS5KTnVsbChudWxsKSk7XG4gICAgICAgICAgICBjb25zdCBqYXJWYWx1ZSA9IGphcnJheS52YWx1ZTtcbiAgICAgICAgICAgIGV4cGVjdChqYXJWYWx1ZVswXS52YWx1ZSkudG8uYmUuZXFsKCdhJyk7XG4gICAgICAgICAgICBleHBlY3QoamFyVmFsdWVbMV0udmFsdWUpLnRvLmJlLmVxbChmYWxzZSk7XG4gICAgICAgICAgICBleHBlY3QoamFyVmFsdWVbMl0udmFsdWUpLnRvLmJlLmVxbChudWxsKTtcbiAgICAgICAgICAgIGV4cGVjdChqYXJyYXkudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdKQXJyYXkoW0pTdHJpbmcoYSksSkJvb2woZmFsc2UpLEpOdWxsKG51bGwpLF0pJyk7XG4gICAgICAgICAgICBleHBlY3QoamFycmF5LmlzSlZhbHVlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGphcnJheS5pc0pBcnJheSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgamFycmF5LnZhbHVlID0gMTIzO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4gSlZhbHVlLkpBcnJheSgnJykpLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IEpWYWx1ZS5KTnVsbCh1bmRlZmluZWQpKS50by50aHJvdztcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiBKVmFsdWUuSk51bGwoTmFOKSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUG9zaXRpb25cXCdzJywgKCkgPT4ge1xuICAgICAgICBjb25zdCByb3dzID0gW1xuICAgICAgICAgICAgWzEsIDIsIDNdLFxuICAgICAgICAgICAgWydhJywgJ2InLCAnYycsICdkJ10sXG4gICAgICAgICAgICBbJ0EnLCAnQicsICdDJ10sXG4gICAgICAgIF07XG4gICAgICAgIGl0KCdpbmNsdWRlIHRhYmxlcyBvZiBjaGFycyBhbmQgYWxsb3cgdG8gcmV0cmlldmUgY2hhciBvcHRpb25zJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDAgPSBQb3NpdGlvbihyb3dzLCAwLCAwKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pc1Bvc2l0aW9uKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS5pc0p1c3QpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMSk7XG4gICAgICAgICAgICBjb25zdCBwb3MxMSA9IFBvc2l0aW9uKHJvd3MsIDEsIDEpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczExLmNoYXIoKS5pc0p1c3QpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QocG9zMTEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ2InKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhbGxvdyB0byBpbmNyZW1lbnQgdGhlIHBvc2l0aW9uIGFuZCByZXRyaWV2ZSBmdXJ0aGVyIGNoYXJzJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMDEgPSBQb3NpdGlvbihyb3dzLCAwLCAwKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDEuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoMik7XG4gICAgICAgICAgICBjb25zdCBwb3MyMCA9IFBvc2l0aW9uKHJvd3MsIDEsIDMpLmluY3JQb3MoKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MyMC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnQScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybiBOb3RoaW5nIHdoZW4gcG9zaXRpb24gaXMgYmV5b25kIHRoZSBjb250YWluZWQgcm93cyBjb250ZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zMTAxMCA9IFBvc2l0aW9uKHJvd3MsIDEwLCAxMCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMTAxMC5jaGFyKCkuaXNOb3RoaW5nKS50by5iZS50cnVlO1xuICAgICAgICAgICAgY29uc3QgcG9zMjMgPSBQb3NpdGlvbihyb3dzLCAyLCAyKS5pbmNyUG9zKCk7XG4gICAgICAgICAgICBleHBlY3QocG9zMjMuY2hhcigpLmlzTm90aGluZykudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdjYW4gYmUgaW5pdGlhbGl6ZWQgZnJvbSB0ZXh0IHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MwMCA9IFBvc2l0aW9uLmZyb21UZXh0KCdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCcpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAwLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdMJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpXG4gICAgICAgICAgICAgICAgLmNoYXIoKS52YWx1ZSkudG8uYmUuZXFsKCdtJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnY2FuIGJlIGluaXRpYWxpemVkIGFsc28gZnJvbSBtdWx0aWxpbmUgdGV4dCBzdHJpbmdzLCBzdHJpcHBpbmcgbmV3bGluZXMgYXdheScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAwID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtIFxcbmlwc3VtJyk7XG4gICAgICAgICAgICBleHBlY3QocG9zMDAuY2hhcigpLnZhbHVlKS50by5iZS5lcWwoJ0wnKTtcbiAgICAgICAgICAgIGV4cGVjdChwb3MwMC5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKS5pbmNyUG9zKCkuaW5jclBvcygpLmluY3JQb3MoKVxuICAgICAgICAgICAgICAgIC5jaGFyKCkudmFsdWUpLnRvLmJlLmVxbCgnaScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JldHVybiBzdHJpbmdzIGNvbnRhaW5pbmcgYWxsIGNoYXJhY3RlcnMgc3RhcnRpbmcgZnJvbSBhIGdpdmVuIHBvc2l0aW9uLCBmb3IgdGhlIHNha2Ugb2YgdGVzdGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvczAxID0gUG9zaXRpb24uZnJvbVRleHQoJ0xvcmVtJykuaW5jclBvcygpO1xuICAgICAgICAgICAgZXhwZWN0KHBvczAxLnJlc3QoKSkudG8uYmUuZXFsKCdvcmVtJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3NvbWVzJywgKCkgPT4ge1xuICAgICAgICBpdCgnaW5jbHVkZSBhIHZhbHVlIGFuZCBhbGxvdyB0byByZXRyaWV2ZSBpdCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFTb21lID0gc29tZSgxMik7XG4gICAgICAgICAgICBleHBlY3QoYVNvbWUudmFsKCkpLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTb21lKGFTb21lKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhU29tZS50b1N0cmluZygpKS50by5iZS5lcWwoJ3NvbWUoMTIpJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ25vbmVzJywgKCkgPT4ge1xuICAgICAgICBpdCgnYXJlIGp1c3QgYSBzaWducG9zdCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFOb25lID0gbm9uZSgpO1xuICAgICAgICAgICAgZXhwZWN0KGFOb25lLnZhbCgpKS50by5iZS5udWxsO1xuICAgICAgICAgICAgZXhwZWN0KGlzTm9uZShhTm9uZSkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoYU5vbmUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdub25lKCknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgncGFpcnMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDIgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBwYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclswXSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnR5cGUpLnRvLmJlLmVxbCgncGFpcicpO1xuICAgICAgICAgICAgZXhwZWN0KGlzUGFpcihhcGFpcikpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIGFjdHVhbGx5IGFycmF5cywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYSwgYl0gPSBwYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUGFpclxcJ3MnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdpbmNsdWRlIDIgdmFsdWVzIGFuZCBhbGxvdyB0byByZXRyaWV2ZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpclswXSkudG8uYmUuZXFsKHRydWUpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLnR5cGUpLnRvLmJlLmVxbCgncGFpcicpO1xuICAgICAgICAgICAgZXhwZWN0KGFwYWlyLmlzUGFpcikudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChhcGFpci50b1N0cmluZygpKS50by5iZS5lcWwoJ1t0cnVlLDEyXScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBpbW11dGFibGUsIGFuZCB0aHJvdyBpZiB5b3UgdHJ5IHRvIGNoYW5nZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXBhaXIgPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVswXSA9IGZhbHNlO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMV0gPSAxMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSB0cnVlIGl0ZXJhYmxlcywgYW5kIHRoZXJlZm9yZSBhbGxvdyBwb3NpdGlvbmFsIGRlc3RydWN0dXJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYSwgYl0gPSBUdXBsZS5QYWlyKHRydWUsIDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnVHJpcGxlXFwncycsICgpID0+IHtcbiAgICAgICAgaXQoJ2luY2x1ZGUgMyB2YWx1ZXMgYW5kIGFsbG93IHRvIHJldHJpZXZlIHRoZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhdHJpcGxlID0gVHVwbGUuVHJpcGxlKHRydWUsIDEyLCAnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGVbMF0pLnRvLmJlLmVxbCh0cnVlKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGVbMl0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGUudHlwZSkudG8uYmUuZXFsKCd0cmlwbGUnKTtcbiAgICAgICAgICAgIGV4cGVjdChhdHJpcGxlLmlzVHJpcGxlKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KGF0cmlwbGUudG9TdHJpbmcoKSkudG8uYmUuZXFsKCdbdHJ1ZSwxMixhXScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FyZSBpbW11dGFibGUsIGFuZCB0aHJvdyBpZiB5b3UgdHJ5IHRvIGNoYW5nZSB0aGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXRyaXBsZSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRyaXBsZVswXSA9IGZhbHNlO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0cmlwbGVbMV0gPSAxMztcbiAgICAgICAgICAgIH0pLnRvLnRocm93O1xuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhdHJpcGxlWzJdID0gJ2InO1xuICAgICAgICAgICAgfSkudG8udGhyb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnYXJlIHRydWUgaXRlcmFibGVzLCBhbmQgdGhlcmVmb3JlIGFsbG93IHBvc2l0aW9uYWwgZGVzdHJ1Y3R1cmluZycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFthLCBiLCBjXSA9IFR1cGxlLlRyaXBsZSh0cnVlLCAxMiwgJ2EnKTtcbiAgICAgICAgICAgIGV4cGVjdChhKS50by5iZS5lcWwodHJ1ZSk7XG4gICAgICAgICAgICBleHBlY3QoYikudG8uYmUuZXFsKDEyKTtcbiAgICAgICAgICAgIGV4cGVjdChjKS50by5iZS5lcWwoJ2EnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnc3VjY2VzcyBhbmQgZmFpbHVyZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnbWF5IHJlcHJlc2VudCBzdWNjZXNzZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWNjID0gc3VjY2Vzcyh0cnVlLCAxMik7XG4gICAgICAgICAgICBleHBlY3Qoc3VjY1swXSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChzdWNjWzFdKS50by5iZS5lcWwoMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGlzU3VjY2VzcyhzdWNjKSkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIGV4cGVjdChpc1BhaXIoc3VjYykpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnbWF5IHJlcHJlc2VudCBmYWlsdXJlcycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZhaWwgPSBmYWlsdXJlKCdhJywgMTIpO1xuICAgICAgICAgICAgZXhwZWN0KGZhaWxbMF0pLnRvLmJlLmVxbCgnYScpO1xuICAgICAgICAgICAgZXhwZWN0KGZhaWxbMV0pLnRvLmJlLmVxbCgxMik7XG4gICAgICAgICAgICBleHBlY3QoaXNTdWNjZXNzKGZhaWwpKS50by5iZS5mYWxzZTtcbiAgICAgICAgICAgIGV4cGVjdChpc0ZhaWx1cmUoZmFpbCkpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICBleHBlY3QoaXNQYWlyKGZhaWwpKS50by5iZS50cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIl19