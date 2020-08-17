start
  = groups

_ "whitespace"
  = [ \t\n\r]

and
  = _+ 'AND' _+ / _* ( '&&' / ',' ) _*

or
  = _+ 'OR' _+ / _* ( '||' ) _*

not
  = 'NOT' _+ / _* ( '!' / '-' ) _*

operator
  = and / or

forbid_start
  = '(' / not

groups
  = '(' value:expression ')' { return value; }
  / value:expression { return value; }

expression
  = left:tag_wrap right:(operator groups)+ { return [left].concat(...right.map(el => el[1])); }
  / value:tag_wrap { return [value]; }

tag_wrap
  = '(' value:tag_wrap ')' { return value; }
  / not? value:tag { return value; }

tag
  = name:$(!forbid_start side+) { var _loc = location(); return { name, pos: [ _loc.start.offset, _loc.end.offset ] }; }

side
  = value:$(!operator .) { return value }
