function Pair(_1, _2) {
    this._1 = _1;
    this._2 = _2;
}

Pair.prototype.first = function() {
    return this._1;
};
Pair.prototype.second = function() {
    return this._2;
};

export {Pair};