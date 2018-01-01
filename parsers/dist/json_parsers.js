define(['exports', 'classes', 'parsers'], function (exports, _classes, _parsers) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.junescapedCharP = exports.JBoolP = exports.JNullP = undefined;
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

    var junescapedCharP = exports.junescapedCharP = (0, _parsers.parser)((0, _parsers.predicateBasedParser)(function (char) {
        return char !== '\\' && char !== '"';
    }, 'junescapedCharP'));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzL2pzb25fcGFyc2Vycy5qcyJdLCJuYW1lcyI6WyJKTnVsbFAiLCJmbWFwIiwiSk51bGwiLCJzZXRMYWJlbCIsIkpUcnVlUCIsIkpCb29sIiwiSkZhbHNlUCIsIkpCb29sUCIsIm9yRWxzZSIsImp1bmVzY2FwZWRDaGFyUCIsImNoYXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFpQ08sUUFBTUEsMEJBQVMsc0JBQVEsTUFBUixFQUFnQkMsSUFBaEIsQ0FBcUI7QUFBQSxlQUFLLGdCQUFPQyxLQUFQLENBQWEsSUFBYixDQUFMO0FBQUEsS0FBckIsRUFBOENDLFFBQTlDLENBQXVELE1BQXZELENBQWY7O0FBRVAsUUFBTUMsU0FBUyxzQkFBUSxNQUFSLEVBQWdCSCxJQUFoQixDQUFxQjtBQUFBLGVBQUssZ0JBQU9JLEtBQVAsQ0FBYSxJQUFiLENBQUw7QUFBQSxLQUFyQixDQUFmO0FBQ0EsUUFBTUMsVUFBVSxzQkFBUSxPQUFSLEVBQWlCTCxJQUFqQixDQUFzQjtBQUFBLGVBQUssZ0JBQU9JLEtBQVAsQ0FBYSxLQUFiLENBQUw7QUFBQSxLQUF0QixDQUFoQjtBQUNPLFFBQU1FLDBCQUFTSCxPQUFPSSxNQUFQLENBQWNGLE9BQWQsRUFBdUJILFFBQXZCLENBQWdDLE1BQWhDLENBQWY7O0FBRUEsUUFBTU0sNENBQWtCLHFCQUFPLG1DQUFxQjtBQUFBLGVBQVNDLFNBQVMsSUFBVCxJQUFpQkEsU0FBUyxHQUFuQztBQUFBLEtBQXJCLEVBQThELGlCQUE5RCxDQUFQLENBQXhCIiwiZmlsZSI6Impzb25fcGFyc2Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgSlZhbHVlLFxuICAgIFR1cGxlLFxufSBmcm9tICdjbGFzc2VzJztcbmltcG9ydCB7XG4gICAgcGFyc2VyLFxuICAgIGNoYXJQYXJzZXIsXG4gICAgZGlnaXRQYXJzZXIsXG4gICAgcHJlZGljYXRlQmFzZWRQYXJzZXIsXG4gICAgcGNoYXIsXG4gICAgcGRpZ2l0LFxuICAgIGFuZFRoZW4sXG4gICAgb3JFbHNlLFxuICAgIGNob2ljZSxcbiAgICBhbnlPZixcbiAgICBmbWFwLFxuICAgIHJldHVyblAsXG4gICAgYXBwbHlQLFxuICAgIGxpZnQyLFxuICAgIHNlcXVlbmNlUCxcbiAgICBzZXF1ZW5jZVAyLFxuICAgIHBzdHJpbmcsXG4gICAgemVyb09yTW9yZSxcbiAgICBtYW55LFxuICAgIG1hbnkxLFxuICAgIG9wdCxcbiAgICBvcHRCb29rLFxuICAgIGRpc2NhcmRGaXJzdCxcbiAgICBkaXNjYXJkU2Vjb25kLFxuICAgIGJldHdlZW4sXG4gICAgYmV0d2VlblBhcmVucyxcbn0gZnJvbSAncGFyc2Vycyc7XG5cbmV4cG9ydCBjb25zdCBKTnVsbFAgPSBwc3RyaW5nKCdudWxsJykuZm1hcChfID0+IEpWYWx1ZS5KTnVsbChudWxsKSkuc2V0TGFiZWwoJ251bGwnKTtcblxuY29uc3QgSlRydWVQID0gcHN0cmluZygndHJ1ZScpLmZtYXAoXyA9PiBKVmFsdWUuSkJvb2wodHJ1ZSkpO1xuY29uc3QgSkZhbHNlUCA9IHBzdHJpbmcoJ2ZhbHNlJykuZm1hcChfID0+IEpWYWx1ZS5KQm9vbChmYWxzZSkpO1xuZXhwb3J0IGNvbnN0IEpCb29sUCA9IEpUcnVlUC5vckVsc2UoSkZhbHNlUCkuc2V0TGFiZWwoJ2Jvb2wnKTtcblxuZXhwb3J0IGNvbnN0IGp1bmVzY2FwZWRDaGFyUCA9IHBhcnNlcihwcmVkaWNhdGVCYXNlZFBhcnNlcihjaGFyID0+IChjaGFyICE9PSAnXFxcXCcgJiYgY2hhciAhPT0gJ1wiJyksICdqdW5lc2NhcGVkQ2hhclAnKSk7XG4iXX0=