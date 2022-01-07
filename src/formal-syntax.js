import { memoizeWith, identity, without, range } from 'ramda'

// IMAP Formal Syntax
// http://tools.ietf.org/html/rfc3501#section-9

const expandRange = (start, end) => String.fromCharCode.apply(String, range(start, end + 1))
const excludeChars = (source, exclude) => without(exclude.split(''), source.split('')).join('')

export const ASCII_NL = 10
export const ASCII_CR = 13
export const ASCII_SPACE = 32
export const ASCII_DQUOTE = 34 // "
export const ASCII_PERCENT_SIGN = 37 // %
export const ASCII_LEFT_PARENTHESIS = 40 // (
export const ASCII_RIGHT_PARENTHESIS = 41 // )
export const ASCII_ASTERISK = 42 // *
export const ASCII_PLUS = 43 // +
export const ASCII_COMMA = 44 // ,
export const ASCII_FULL_STOP = 46 // .
export const ASCII_COLON = 58 // :
export const ASCII_LESS_THAN_SIGN = 60 // <
export const ASCII_GREATER_THAN_SIGN = 62 // >
export const ASCII_LEFT_BRACKET = 91 // [
export const ASCII_BACKSLASH = 92 //
export const ASCII_RIGHT_BRACKET = 93 // ]
export const ASCII_LEFT_CURLY_BRACKET = 123 // {
export const ASCII_RIGHT_CURLY_BRACKET = 125 // }

export const IS_CHAR = (chr) => chr >= 0x01 && chr <= 0x7F
export const IS_ATOM_CHAR = (chr) => IS_CHAR(chr) && !IS_ATOM_SPECIALS(chr)
export const IS_ATOM_SPECIALS = (chr) => chr === ASCII_LEFT_PARENTHESIS ||
  chr === ASCII_RIGHT_PARENTHESIS ||
  chr === ASCII_LEFT_CURLY_BRACKET ||
  chr === ASCII_SPACE ||
  IS_CTL(chr) ||
  IS_LIST_WILDCARDS(chr) ||
  IS_QUOTED_SPECIALS(chr) ||
  IS_RESP_SPECIALS(chr)
export const IS_CTL = (chr) => (chr >= 0x00 && chr <= 0x1F) || chr === 0x7F
export const IS_LIST_WILDCARDS = (chr) => chr === ASCII_PERCENT_SIGN || chr === ASCII_ASTERISK
export const IS_QUOTED_SPECIALS = (chr) => chr === ASCII_DQUOTE || chr === ASCII_BACKSLASH
export const IS_RESP_SPECIALS = (chr) => chr === ASCII_RIGHT_BRACKET
export const IS_DIGIT = (chr) => chr >= 0x30 && chr <= 0x39

export const CHAR = memoizeWith(identity, () => expandRange(0x01, 0x7F))
export const CHAR8 = memoizeWith(identity, () => expandRange(0x01, 0xFF))
export const SP = () => ' '
export const CTL = memoizeWith(identity, () => expandRange(0x00, 0x1F) + '\x7F')
export const DQUOTE = () => '"'
export const ALPHA = memoizeWith(identity, () => expandRange(0x41, 0x5A) + expandRange(0x61, 0x7A))
export const DIGIT = memoizeWith(identity, () => expandRange(0x30, 0x39) + expandRange(0x61, 0x7A))
export const ATOM_CHAR = memoizeWith(identity, () => excludeChars(CHAR(), ATOM_SPECIALS()))
export const ASTRING_CHAR = memoizeWith(identity, () => ATOM_CHAR() + RESP_SPECIALS())
export const TEXT_CHAR = memoizeWith(identity, () => excludeChars(CHAR(), '\r\n'))
export const ATOM_SPECIALS = memoizeWith(identity, () => '(' + ')' + '{' + SP() + CTL() + LIST_WILDCARDS() + QUOTED_SPECIALS() + RESP_SPECIALS())
export const LIST_WILDCARDS = () => '%' + '*'
export const QUOTED_SPECIALS = memoizeWith(identity, () => DQUOTE() + '\\')
export const RESP_SPECIALS = () => ']'
export const TAG = memoizeWith(identity, () => excludeChars(ASTRING_CHAR(), '+'))
export const COMMAND = memoizeWith(identity, () => ALPHA() + DIGIT())
export const verify = function (str, allowedChars) {
  for (var i = 0, len = str.length; i < len; i++) {
    if (allowedChars.indexOf(str.charAt(i)) < 0) {
      return i
    }
  }
  return -1
}
