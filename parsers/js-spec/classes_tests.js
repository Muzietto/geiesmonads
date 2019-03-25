import {expect} from 'chai';
import {
    isPair,
    isSuccess,
    isFailure,
    isSome,
    isNone,
} from 'util';
import {
    pair,
    success,
    failure,
    some,
    none,
    Position,
    Tuple,
    JValue,
} from 'classes';

describe('among helper classes', () => {

    describe('Position\'s', () => {
        const rows = [
            [1, 2, 3],
            ['a', 'b', 'c', 'd'],
            ['A', 'B', 'C'],
        ];
        it('include tables of chars and allow to retrieve char options', () => {
            const pos00 = Position(rows, 0, 0);
            expect(pos00.isPosition).to.be.true;
            expect(pos00.char().isJust).to.be.true;
            expect(pos00.char().value).to.be.eql(1);
            const pos11 = Position(rows, 1, 1);
            expect(pos11.char().isJust).to.be.true;
            expect(pos11.char().value).to.be.eql('b');
        });
        it('allow to increment the position and retrieve further chars', () => {
            const pos01 = Position(rows, 0, 0).incrPos();
            expect(pos01.char().value).to.be.eql(2);
            const pos20 = Position(rows, 1, 3).incrPos();
            expect(pos20.char().value).to.be.eql('A');
            const pos22 = Position(rows, 1, 3).incrPos(3);
            expect(pos22.char().value).to.be.eql('C');
        });
        it('allow to decrement the position and retrieve further chars', () => {
            const pos01 = Position(rows, 0, 2).decrPos();
            expect(pos01.char().value).to.be.eql(2);
            const pos13 = Position(rows, 2, 0).decrPos();
            expect(pos13.char().value).to.be.eql('d');
            const pos02 = Position(rows, 2, 0).decrPos(5);
            expect(pos02.char().value).to.be.eql(3);
        });
        it('return char() === Nothing when position is beyond the contained rows content', () => {
            const pos1010 = Position(rows, 10, 10);
            expect(pos1010.char().isNothing).to.be.true;
            const pos23 = Position(rows, 2, 2).incrPos();
            expect(pos23.char().isNothing).to.be.true;
        });
        it('return char() === Nothing when incrementing at the end', () => {
            const posBeyond1 = Position(rows, 2, 2).incrPos();
            expect(posBeyond1.char().isNothing).to.be.true;
            const posBeyondALot = Position(rows, 0, 0).incrPos(100);
            expect(posBeyondALot.char().isNothing).to.be.true;
        });
        it('return char() === Nothing when decrementing at the start', () => {
            const posMinus1 = Position(rows, 0, 0).decrPos();
            expect(posMinus1.char().isNothing).to.be.true;
            const posMinus10 = Position(rows, 0, 0).decrPos(10);
            expect(posMinus10.char().isNothing).to.be.true;
        });
        it('can be initialized from text strings', () => {
            const pos00 = Position.fromText('Lorem ipsum dolor sit amet');
            expect(pos00.char().value).to.be.eql('L');
            expect(pos00.incrPos().incrPos().incrPos().incrPos()
                .char().value).to.be.eql('m');
        });
        it('can be initialized also from multiline text strings, stripping newlines away', () => {
            const pos00 = Position.fromText('Lorem \nipsum');
            expect(pos00.char().value).to.be.eql('L');
            expect(pos00.incrPos().incrPos().incrPos().incrPos().incrPos().incrPos()
                .char().value).to.be.eql('i');
        });
        it('return strings containing all characters starting from a given position, for the sake of testing', () => {
            const pos01 = Position.fromText('Lorem').incrPos();
            expect(pos01.rest()).to.be.eql('orem');
        });
        it('returns rest === \'\' when we get to the end', () => {
            const pos01 = Position.fromText('L').incrPos();
            expect(pos01.rest()).to.be.eql('');
        });
    });

    describe('somes', () => {
        it('include a value and allow to retrieve it', () => {
            const aSome = some(12);
            expect(aSome.val()).to.be.eql(12);
            expect(isSome(aSome)).to.be.true;
            expect(aSome.toString()).to.be.eql('some(12)');
        });
    });

    describe('nones', () => {
        it('are just a signpost', () => {
            const aNone = none();
            expect(aNone.val()).to.be.null;
            expect(isNone(aNone)).to.be.true;
            expect(aNone.toString()).to.be.eql('none()');
        });
    });

    describe('pairs', () => {
        it('include 2 values and allow to retrieve them', () => {
            const apair = pair(true, 12);
            expect(apair[0]).to.be.eql(true);
            expect(apair[1]).to.be.eql(12);
            expect(apair.type).to.be.eql('pair');
            expect(isPair(apair)).to.be.true;
        });
        it('are actually arrays, and therefore allow positional destructuring', () => {
            const [a, b] = pair(true, 12);
            expect(a).to.be.eql(true);
            expect(b).to.be.eql(12);
        });
    });

    describe('Pair\'s', () => {
        it('include 2 values and allow to retrieve them', () => {
            const apair = Tuple.Pair(true, 12);
            expect(apair[0]).to.be.eql(true);
            expect(apair[1]).to.be.eql(12);
            expect(apair.type).to.be.eql('pair');
            expect(apair.isPair).to.be.true;
            expect(apair.toString()).to.be.eql('[true,12]');
        });
        it('are immutable, and throw if you try to change them', () => {
            const apair = Tuple.Pair(true, 12);
            expect(() => {
                atriple[0] = false;
            }).to.throw;
            expect(() => {
                atriple[1] = 13;
            }).to.throw;
        });
        it('are true iterables, and therefore allow positional destructuring', () => {
            const [a, b] = Tuple.Pair(true, 12);
            expect(a).to.be.eql(true);
            expect(b).to.be.eql(12);
        });
    });

    describe('Triple\'s', () => {
        it('include 3 values and allow to retrieve them', () => {
            const atriple = Tuple.Triple(true, 12, 'a');
            expect(atriple[0]).to.be.eql(true);
            expect(atriple[1]).to.be.eql(12);
            expect(atriple[2]).to.be.eql('a');
            expect(atriple.type).to.be.eql('triple');
            expect(atriple.isTriple).to.be.true;
            expect(atriple.toString()).to.be.eql('[true,12,a]');
        });
        it('are immutable, and throw if you try to change them', () => {
            const atriple = Tuple.Triple(true, 12, 'a');
            expect(() => {
                atriple[0] = false;
            }).to.throw;
            expect(() => {
                atriple[1] = 13;
            }).to.throw;
            expect(() => {
                atriple[2] = 'b';
            }).to.throw;
        });
        it('are true iterables, and therefore allow positional destructuring', () => {
            const [a, b, c] = Tuple.Triple(true, 12, 'a');
            expect(a).to.be.eql(true);
            expect(b).to.be.eql(12);
            expect(c).to.be.eql('a');
        });
    });

    describe('success and failure', () => {
        beforeEach(() => {
        });
        it('may represent successes', () => {
            const succ = success(true, 12);
            expect(succ[0]).to.be.true;
            expect(succ[1]).to.be.eql(12);
            expect(isSuccess(succ)).to.be.true;
            expect(isPair(succ)).to.be.true;
        });
        it('may represent failures', () => {
            const fail = failure('a', 12);
            expect(fail[0]).to.be.eql('a');
            expect(fail[1]).to.be.eql(12);
            expect(isSuccess(fail)).to.be.false;
            expect(isFailure(fail)).to.be.true;
            expect(isPair(fail)).to.be.true;
        });
    });

    describe('JValue\'s are parsed JSON values', () => {
        describe('with JString\'s as parsed JSON string values', () => {
            const jstring = JValue.JString('abc');
            it('that are retrievable', () => {
                expect(jstring.value).to.be.eql('abc');
                expect(jstring.toString()).to.be.eql('JString(abc)');
            });
            it('that are immutable', () => {
                expect(() => {
                    jstring.value = 'def';
                }).to.throw;
            });
            it('that gotta be strings', () => {
                expect(() => JValue.JString(123)).to.throw;
            });
            it('that gotta by types with a supertype', () => {
                const jstring = JValue.JString('123');
                expect(jstring.isJValue).to.be.true;
                expect(jstring.isJString).to.be.true;
            });
        });
        it('with JNumber\'s as parsed JSON float values', () => {
            const jnumber = JValue.JNumber(123.45e-23);
            expect(jnumber.value).to.be.eql(123.45e-23);
            expect(jnumber.toString()).to.be.eql('JNumber(1.2345e-21)');
            expect(jnumber.isJValue).to.be.true;
            expect(jnumber.isJNumber).to.be.true;
            expect(() => {
                jnumber.value = 123;
            }).to.throw;
            expect(() => JValue.JNumber('x')).to.throw;
            expect(() => JValue.JNumber(NaN)).to.throw;
        });
        it('with JBool\'s as parsed JSON boolean values', () => {
            const jbool = JValue.JBool(true);
            expect(jbool.value).to.be.true;
            expect(jbool.toString()).to.be.eql('JBool(true)');
            expect(jbool.isJValue).to.be.true;
            expect(jbool.isJBool).to.be.true;
            expect(() => {
                jbool.value = false;
            }).to.throw;
            expect(() => JValue.JBool('x')).to.throw;
            expect(() => JValue.JBool(123)).to.throw;
            expect(() => JValue.JBool(NaN)).to.throw;
        });
        it('with JNull\'s as parsed JSON null values', () => {
            const jnull = JValue.JNull(null);
            expect(jnull.value).to.be.null;
            expect(jnull.toString()).to.be.eql('JNull(null)');
            expect(jnull.isJValue).to.be.true;
            expect(jnull.isJNull).to.be.true;
            expect(() => {
                jnull.value = 123;
            }).to.throw;
            expect(() => JValue.JNull('')).to.throw;
            expect(() => JValue.JNull(undefined)).to.throw;
            expect(() => JValue.JNull(NaN)).to.throw;
        });
        it('with JArray\'s as parsed JSON arrays', () => {
            const jarray = JValue.JArray(JValue.JString('a'), JValue.JBool(false), JValue.JNull(null));
            const jarValue = jarray.value;
            expect(jarValue[0].value).to.be.eql('a');
            expect(jarValue[1].value).to.be.eql(false);
            expect(jarValue[2].value).to.be.eql(null);
            expect(jarray.toString()).to.be.eql('JArray([JString(a),JBool(false),JNull(null),])');
            expect(jarray.isJValue).to.be.true;
            expect(jarray.isJArray).to.be.true;
            expect(() => {
                jarray.value = 123;
            }).to.throw;
            expect(() => JValue.JArray('')).to.throw;
            expect(() => JValue.JArray(undefined)).to.throw;
            expect(() => JValue.JArray(NaN)).to.throw;
        });
        it('with JObjects\'s as parsed JSON objects', () => {
            const jobject = JValue.JObject(
                Tuple.Pair('string', JValue.JString('a')),
                Tuple.Pair('boolean', JValue.JBool(false)),
                Tuple.Pair('null', JValue.JNull(null))
            );
            expect(jobject['string'].value).to.be.eql('a');
            expect(jobject['boolean'].value).to.be.eql(false);
            expect(jobject['null'].value).to.be.eql(null);
            //expect(jobject.toString()).to.be.eql('JArray([JString(a),JBool(false),JNull(null),])');
            expect(jobject.isJValue).to.be.true;
            expect(jobject.isJObject).to.be.true;
            expect(() => {
                jobject.string = 'abc';
            }).to.throw;
            expect(() => JValue.JObject(JValue.JObject(
                Tuple.Pair('string', JValue.JString('a')),
                Tuple.Pair('boolean', false), // value must be a JValue
                Tuple.Pair('null', JValue.JNull(null))
            ))).to.throw;
            expect(() => JValue.JObject(JValue.JObject(
                Tuple.Pair('string', JValue.JString('a')),
                Tuple.Pair(123, JValue.JNull(null)) // key must be a string
            ))).to.throw;
            expect(() => JValue.JNull(Tuple.Triple(1,2,3))).to.throw;
        });

    });
});
