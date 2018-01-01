define(['exports', 'classes', 'parsers'], function (exports, _classes, _parsers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.jEscapedCharP = exports.jUnescapedCharP = exports.JBoolP = exports.JNullP = undefined;
    var JNullP = exports.JNullP = (0, _parsers.pstring)('null').fmap(function (_) {
        return _classes.JValue.JNull(null);
    }).setLabel('null');

    var JTrueP = (0, _parsers.pstring)('true').fmap(function (_) {
        return _classes.JValue.JBool(true);
    });
    var JFalseP = (0, _parsers.pstring)('false').fmap(function (_) {
        return _classes.JValue.JBool(false);
    });
    var JBoolP = exports.JBoolP = JTrueP.orElse(JFalseP).setLabel('bool');

    var jUnescapedCharP = exports.jUnescapedCharP = (0, _parsers.parser)((0, _parsers.predicateBasedParser)(function (char) {
        return char !== '\\' && char !== '"';
    }, 'junescapedCharP'));
    var escapedJSONChars = ['\"', '\\', '\/', '\b', '\f',
    //    '\n', // newlines will be removed during text -> position transformation
    '\r', '\t'];
    var jEscapedCharP = exports.jEscapedCharP = (0, _parsers.choice)(escapedJSONChars.map(_parsers.pchar));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImpVbmVzY2FwZWRDaGFyUCIsImNoYXIiLCJlc2NhcGVkSlNPTkNoYXJzIiwiakVzY2FwZWRDaGFyUCIsIm1hcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWlDTyxRQUFNQSwwQkFBUyxzQkFBUSxNQUFSLEVBQWdCQyxJQUFoQixDQUFxQjtBQUFBLGVBQUssZ0JBQU9DLEtBQVAsQ0FBYSxJQUFiLENBQUw7QUFBQSxLQUFyQixFQUE4Q0MsUUFBOUMsQ0FBdUQsTUFBdkQsQ0FBZjs7QUFFUCxRQUFNQyxTQUFTLHNCQUFRLE1BQVIsRUFBZ0JILElBQWhCLENBQXFCO0FBQUEsZUFBSyxnQkFBT0ksS0FBUCxDQUFhLElBQWIsQ0FBTDtBQUFBLEtBQXJCLENBQWY7QUFDQSxRQUFNQyxVQUFVLHNCQUFRLE9BQVIsRUFBaUJMLElBQWpCLENBQXNCO0FBQUEsZUFBSyxnQkFBT0ksS0FBUCxDQUFhLEtBQWIsQ0FBTDtBQUFBLEtBQXRCLENBQWhCO0FBQ08sUUFBTUUsMEJBQVNILE9BQU9JLE1BQVAsQ0FBY0YsT0FBZCxFQUF1QkgsUUFBdkIsQ0FBZ0MsTUFBaEMsQ0FBZjs7QUFFQSxRQUFNTSw0Q0FBa0IscUJBQU8sbUNBQXFCO0FBQUEsZUFBU0MsU0FBUyxJQUFULElBQWlCQSxTQUFTLEdBQW5DO0FBQUEsS0FBckIsRUFBOEQsaUJBQTlELENBQVAsQ0FBeEI7QUFDUCxRQUFNQyxtQkFBbUIsQ0FDckIsSUFEcUIsRUFFckIsSUFGcUIsRUFHckIsSUFIcUIsRUFJckIsSUFKcUIsRUFLckIsSUFMcUI7QUFNekI7QUFDSSxRQVBxQixFQVFyQixJQVJxQixDQUF6QjtBQVVPLFFBQU1DLHdDQUFnQixxQkFBT0QsaUJBQWlCRSxHQUFqQixnQkFBUCxDQUF0QiIsImZpbGUiOiJqc29uX3BhcnNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEpWYWx1ZSxcbiAgICBUdXBsZSxcbn0gZnJvbSAnY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIHBhcnNlcixcbiAgICBjaGFyUGFyc2VyLFxuICAgIGRpZ2l0UGFyc2VyLFxuICAgIHByZWRpY2F0ZUJhc2VkUGFyc2VyLFxuICAgIHBjaGFyLFxuICAgIHBkaWdpdCxcbiAgICBhbmRUaGVuLFxuICAgIG9yRWxzZSxcbiAgICBjaG9pY2UsXG4gICAgYW55T2YsXG4gICAgZm1hcCxcbiAgICByZXR1cm5QLFxuICAgIGFwcGx5UCxcbiAgICBsaWZ0MixcbiAgICBzZXF1ZW5jZVAsXG4gICAgc2VxdWVuY2VQMixcbiAgICBwc3RyaW5nLFxuICAgIHplcm9Pck1vcmUsXG4gICAgbWFueSxcbiAgICBtYW55MSxcbiAgICBvcHQsXG4gICAgb3B0Qm9vayxcbiAgICBkaXNjYXJkRmlyc3QsXG4gICAgZGlzY2FyZFNlY29uZCxcbiAgICBiZXR3ZWVuLFxuICAgIGJldHdlZW5QYXJlbnMsXG59IGZyb20gJ3BhcnNlcnMnO1xuXG5leHBvcnQgY29uc3QgSk51bGxQID0gcHN0cmluZygnbnVsbCcpLmZtYXAoXyA9PiBKVmFsdWUuSk51bGwobnVsbCkpLnNldExhYmVsKCdudWxsJyk7XG5cbmNvbnN0IEpUcnVlUCA9IHBzdHJpbmcoJ3RydWUnKS5mbWFwKF8gPT4gSlZhbHVlLkpCb29sKHRydWUpKTtcbmNvbnN0IEpGYWxzZVAgPSBwc3RyaW5nKCdmYWxzZScpLmZtYXAoXyA9PiBKVmFsdWUuSkJvb2woZmFsc2UpKTtcbmV4cG9ydCBjb25zdCBKQm9vbFAgPSBKVHJ1ZVAub3JFbHNlKEpGYWxzZVApLnNldExhYmVsKCdib29sJyk7XG5cbmV4cG9ydCBjb25zdCBqVW5lc2NhcGVkQ2hhclAgPSBwYXJzZXIocHJlZGljYXRlQmFzZWRQYXJzZXIoY2hhciA9PiAoY2hhciAhPT0gJ1xcXFwnICYmIGNoYXIgIT09ICdcIicpLCAnanVuZXNjYXBlZENoYXJQJykpO1xuY29uc3QgZXNjYXBlZEpTT05DaGFycyA9IFtcbiAgICAnXFxcIicsXG4gICAgJ1xcXFwnLFxuICAgICdcXC8nLFxuICAgICdcXGInLFxuICAgICdcXGYnLFxuLy8gICAgJ1xcbicsIC8vIG5ld2xpbmVzIHdpbGwgYmUgcmVtb3ZlZCBkdXJpbmcgdGV4dCAtPiBwb3NpdGlvbiB0cmFuc2Zvcm1hdGlvblxuICAgICdcXHInLFxuICAgICdcXHQnLFxuXTtcbmV4cG9ydCBjb25zdCBqRXNjYXBlZENoYXJQID0gY2hvaWNlKGVzY2FwZWRKU09OQ2hhcnMubWFwKHBjaGFyKSk7XG4iXX0=