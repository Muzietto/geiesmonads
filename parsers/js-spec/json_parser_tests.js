import {expect} from 'chai';
import {
    charParser,
    digitParser,
    pchar,
    pdigit,
    andThen,
    orElse,
    choice,
    anyOf,
    fmap,
    returnP,
    applyP,
    lift2,
    sequenceP,
    sequenceP2,
    pstring,
    zeroOrMore,
    many,
    many1,
    opt,
    optBook,
    discardFirst,
    discardSecond,
    between,
    betweenParens,
} from 'parsers';
import {
    isPair,
    isSuccess,
    isFailure,
    isParser,
    isSome,
    isNone,
} from 'util';
import {Maybe} from 'maybe';
import {Validation} from 'validation';
import {Position} from 'classes';

const lowercases = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',];
const uppercases = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',];
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const whites = [' ', '\t', '\n', '\r'];
const text = Position.fromText;

describe('parsing while discarding input', () => {
    it('allows to exclude parentheses', () => {
        const insideParens = pchar('(')
            .discardFirst(many(anyOf(lowercases)))
            .discardSecond(pchar(')'));
        expect(insideParens.run('(marco)').toString())
            .to.be.eql('Validation.Success([[m,a,r,c,o],row=1;col=0;rest=])');
        expect(insideParens.run('()').toString())
            .to.be.eql('Validation.Success([[],row=1;col=0;rest=])');
    });
    it('...even using a tailor-made method', () => {
        const insideParens = betweenParens(pstring('marco'));
        expect(insideParens.run('(marco)').toString())
            .to.be.eql('Validation.Success([[m,a,r,c,o],row=1;col=0;rest=])');
    });
    it('cherry-picking elements separated by separators', () => {
        const substringsWithCommas = many(many1(anyOf(lowercases)).discardSecond(pchar(',')));
        expect(substringsWithCommas.run('a,b,cd,1').toString())
            .to.be.eql('Validation.Success([[[a],[b],[c,d]],row=0;col=7;rest=1])');
    });
    it('...also when inside a lists', () => {
        const substringsWithCommas = many(many1(anyOf(lowercases)).discardSecond(pchar(',')));
        const listElements = between(pchar('['), substringsWithCommas, pchar(']'));
        expect(listElements.run('[a,b,cd,marco,]1').toString())
            .to.be.eql('Validation.Success([[[a],[b],[c,d],[m,a,r,c,o]],row=0;col=15;rest=1])');
    });
});
