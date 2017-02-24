function mesh () {

    var _nodes;
    var _elements;

    var _nodal_values;

    function _mesh () {}

    _mesh.elements = function (_) {
        if ( !arguments.length ) return _elements;
        _elements = _;
        return _mesh;
    };

    _mesh.nodes = function (_) {
        if ( !arguments.length ) return _nodes;
        _nodes = _;
        return _mesh;
    };

    _mesh.nodal_values = function (_) {
        if ( !arguments.length ) return _nodal_values;
        _nodal_values = _;
        return _mesh;
    };

    _mesh.num_elements = function () {
        return _elements ? _elements.length : 0;
    };

    _mesh.num_nodes = function () {
        return _nodes ? _nodes.length : 0;
    };

    return _mesh;

}

export { mesh }