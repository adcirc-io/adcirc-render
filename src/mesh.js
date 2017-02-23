function mesh () {

    var _nodes;
    var _elements;

    function _mesh () {}

    _mesh.elements = function (_) {

    };

    _mesh.nodes = function (_) {

    };

    _mesh.num_elements = function () {
        return _elements ? _elements.length : 0;
    };

    _mesh.num_nodes = function () {
        return _nodes ? _nodes.length : 0;
    };

}

export { mesh }